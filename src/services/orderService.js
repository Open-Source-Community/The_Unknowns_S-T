import prisma from '../config/prisma.js';
import crypto from 'crypto';
import { TransactionType, TransactionCategory, OrderStatus } from '../data/constants.js';

export const processOrder = async (buyerId, rawItems) => {
    const bId = parseInt(buyerId);

    const consolidatedItems = {};
    for (const item of rawItems) {
        if (consolidatedItems[item.productId]) {
            consolidatedItems[item.productId] += item.quantity;
        } else {
            consolidatedItems[item.productId] = item.quantity;
        }
    }

    const items = Object.entries(consolidatedItems).map(([id, qty]) => ({
        productId: parseInt(id),
        quantity: qty
    }));

    // 1. Pre-fetch products to calculate the total amount securely on the backend
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isHidden: false }
    });

    if (products.length !== items.length) {
        throw new Error("One or more products are unavailable or do not exist.");
    }

    // Map for easy lookup & calculate total
    let totalAmount = 0;
    const productMap = {};
    products.forEach(p => {
        productMap[p.id] = p;
    });

    const orderItemsData = items.map(item => {
        const product = productMap[item.productId];
        totalAmount += parseFloat(product.price) * item.quantity;
        return {
            productId: product.id,
            quantity: item.quantity,
            priceAtPurchase: product.price
        };
    });

    // 2. Execute the Composite Transaction
    return await prisma.$transaction(async (tx) => {
        // A. Verify Wallet Balance
        const wallet = await tx.wallet.findUnique({ where: { userId: bId } });
        if (!wallet || parseFloat(wallet.realBalance) < totalAmount) {
            throw new Error("Insufficient wallet balance to complete this purchase.");
        }

        // B. Create the Order and OrderItems
        const order = await tx.order.create({
            data: {
                buyerId: bId,
                status: OrderStatus.PAID,
                totalAmount: totalAmount,
                items: {
                    create: orderItemsData
                }
            },
            include: { items: true }
        });

        // C. Deduct from Wallet & Create Ledger Transaction
        await tx.wallet.update({
            where: { userId: bId },
            data: { realBalance: { decrement: totalAmount } }
        });

        await tx.transaction.create({
            data: {
                walletId: bId,
                orderId: order.id, // Linking the transaction to the order.
                amount: totalAmount,
                type: TransactionType.DEBIT,
                category: TransactionCategory.PURCHASE,
                description: `Payment for Order #${order.id}`,
                referenceId: `ORD-PAY-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
            }
        });

        // D. Deduct Product Stock
        // If this pushes stock < 0, the PostgreSQL CHECK constraint will fail, throwing an error and rolling back EVERYTHING.
        for (const item of items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } }
            });
        }

        return order;
    });
};

export const getOrdersByUserId = async (buyerId) => {
    return await prisma.order.findMany({
        where: { buyerId: parseInt(buyerId) },
        include: {
            items: {
                include: { product: { select: { name: true } } }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const cancelOrder = async (orderId, userId, role, idempotencyKey) => {
    const oId = parseInt(orderId);
    const uId = parseInt(userId);

    // 1. Fetch the order with its items so we know what to restock
    const order = await prisma.order.findUnique({
        where: { id: oId },
        include: { items: true }
    });

    if (!order) {
        const err = new Error("Order not found.");
        err.statusCode = 404;
        throw err;
    }

    // 2. Ownership & Admin Guard
    if (role !== 'Admin' && order.buyerId !== uId) {
        const err = new Error("Forbidden: You can only cancel your own orders.");
        err.statusCode = 403;
        throw err;
    }

    // 3. Status Guard (The MVP Anti-Scam Protection)
    if (order.status === OrderStatus.SHIPPED) {
        const err = new Error("Order cannot be cancelled because it has already been shipped.");
        err.statusCode = 400;
        throw err;
    }
    if (order.status === OrderStatus.CANCELLED) {
        const err = new Error("Order is already cancelled.");
        err.statusCode = 400;
        throw err;
    }

    // 4. The Reverse Composite Transaction
    return await prisma.$transaction(async (tx) => {
        // A. Update Order Status
        const updatedOrder = await tx.order.update({
            where: { id: oId },
            data: { status: OrderStatus.CANCELLED }
        });

        // B. Refund the Wallet
        await tx.wallet.update({
            where: { userId: order.buyerId },
            data: { realBalance: { increment: order.totalAmount } }
        });

        // C. Create the Refund Ledger Transaction
        await tx.transaction.create({
            data: {
                walletId: order.buyerId,
                orderId: oId,
                amount: order.totalAmount, // Stored as absolute positive value!
                type: TransactionType.CREDIT,
                category: TransactionCategory.REFUND,
                idempotencyKey: idempotencyKey ? `${idempotencyKey}-REF` : null,
                description: `Refund for Cancelled Order #${oId}`,
                referenceId: `ORD-REF-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
            }
        });

        // D. Restore the Product Stock
        for (const item of order.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } }
            });
        }

        return updatedOrder;
    });
};
