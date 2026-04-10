import * as orderService from '../services/orderService.js';

export const createOrder = async (req, res) => {
    try {
        const { userId } = req.user;
        const { items } = req.body; 
        // Expected items format: [{ productId: 1, quantity: 2 }, ...]
        const idempotencyKey = req.headers['idempotency-key'];

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, error: "Order must contain at least one item." });
        }

        for (const item of items) {
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                return res.status(400).json({ success: false, error: "Item quantities must be positive integers." });
            }
        }

        const order = await orderService.processOrder(userId, items, idempotencyKey);
        
        res.status(201).json({ success: true, message: "Order placed successfully!", data: order });
    } catch (error) {
        // Catch PostgreSQL CHECK constraint violation
        if (error.message.includes('stock_non_negative') || error.code === 'P2004' || error.code === 'P2010') {
            return res.status(400).json({ 
                success: false, 
                error: "Checkout failed: One or more items in your cart do not have enough stock available." 
            });
        }

        // Catch Wallet & Validation errors
        const statusCode = error.message.includes("Insufficient") || error.message.includes("unavailable") ? 400 : 500;
        res.status(statusCode).json({ success: false, error: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const { userId } = req.user;
        const orders = await orderService.getOrdersByUserId(userId);
        
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user; // Admin can cancel any order.
        const idempotencyKey = req.headers['idempotency-key'];

        const order = await orderService.cancelOrder(id, userId, role, idempotencyKey);
        
        res.status(200).json({ 
            success: true, 
            message: "Order cancelled successfully. Funds have been refunded to your wallet.", 
            data: order 
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ success: false, error: error.message });
    }
};
