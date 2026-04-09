import prisma from '../config/prisma.js'
import crypto from 'crypto' // for genetating refrenceId
import { TransactionType, TransactionCategory } from '../data/constants.js';

const checkIdempotency = async (tx, idempotencyKey) => {
    if (!idempotencyKey) return null;
    return await tx.transaction.findUnique({
        where: { idempotencyKey: idempotencyKey },
        include: { wallet: true }
    });
};

// deposit
export const depositToWallet = async (userId, amount, description, idempotencyKey) => {
    if (!amount || amount <= 0) {
        const error= new Error("Invalid amount. The deposited amount must be greater than zero.");
        error.statusCode = 400;
        throw  error;
    }
    const uId = parseInt(userId)

    const userExists = await prisma.user.findUnique({
        where: { id: uId },
        include: { wallet: true }
    });

    if (!userExists) {

       const error =new Error("User does not exist in the system.");
        error.statusCode = 404;
        throw  error;
    }


    if (!userExists.wallet) {
       const error= new Error("User found, but no wallet is associated with this account.");
        error.statusCode = 404;
        throw  error;
    }
    return await prisma.$transaction(async (tx) => {

        const existing = await checkIdempotency(tx, idempotencyKey);
        if (existing) return {
            success: true,
            alreadyProcessed: true,
            wallet: existing.wallet
        };

        const updatedWallet = await tx.wallet.update({
            where: { userId: uId },
            data: {
                realBalance: { increment: amount }

            }
        });

        await tx.transaction.create({
            data: {
                walletId: uId,
                amount: amount,
                type: TransactionType.CREDIT,
                idempotencyKey,
                category: TransactionCategory.DEPOSIT,
                description: description || 'Wallet Deposit',
                referenceId: `DEP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
            }
        });
        return { success: true, wallet: updatedWallet };
    });
};


// withdraw

export const withdrawFromWallet = async (userId, amount, description, idempotencyKey) => {
    if (!amount || amount <= 0) {
        const error = new Error("Invalid amount. The withdrawn amount must be greater than zero.");
        error.statusCode = 400;
        throw  error;
    }
    const uId = parseInt(userId);
    const userExists = await prisma.user.findUnique({
        where: { id: uId },
        include: { wallet: true }
    });

    if (!userExists) {
        const error =  new Error("User does not exist in the system.");
        error.statusCode = 404;
        throw  error;
    }
    if (!userExists.wallet) {
        const error =  new Error("User found, but no wallet is associated with this account.");
        error.statusCode = 404;
        throw  error;
    }
    return await prisma.$transaction(async (tx) => {
        const existing = await checkIdempotency(tx, idempotencyKey);
        if (existing) return {
            success: true,
            alreadyProcessed: true,
            wallet: existing.wallet
        };

        const wallet = await tx.wallet.findUnique({
            where: { userId: uId },
        });
        // Check 1: Existence
        if (!wallet) {
             const error = new Error("Wallet not found for this user");
               error.statusCode = 404;
        throw  error;
    }
        // Check 2: Balance
        if (parseFloat(wallet.realBalance) < amount) {
             const error =  new Error("Insufficient balance: You don't have enough funds");
                error.statusCode = 400;
        throw  error;
    }

        const updatedWallet = await tx.wallet.update({
            where: { userId: uId },
            data: { realBalance: { decrement: amount } }
        });
        await tx.transaction.create({
            data: {
                walletId: uId,
                amount: amount,
                type: TransactionType.DEBIT,
                idempotencyKey,
                category: TransactionCategory.WITHDRAW,
                description: description || 'Wallet Withdrawal',
                referenceId: `WTH-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
            }
        });
        return { success: true, wallet: updatedWallet };
    });

};

// transfer funds
export const transferFunds = async (senderId, receiverId, amount, description, idempotencyKey) => {
    if (!amount || amount <= 0) {
         const error =  new Error("Invalid amount. The transferred amount must be greater than zero.");
           error.statusCode = 400;
        throw  error;
    }
    const sId = parseInt(senderId);
    const rId = parseInt(receiverId);

    if (isNaN(sId) || isNaN(rId)) {
         const error =  new Error("Invalid User IDs");
                 error.statusCode = 404;
        throw  error;
    
    }
    return await prisma.$transaction(async (tx) => {

        if (idempotencyKey) {
            const existingTx = await checkIdempotency(tx, idempotencyKey);
            if (existingTx) {
                return {
                    success: true, message: "Duplicate request ignored",
                    alreadyProcessed: true,
                    wallet: existingTx.wallet,
                };
            }
        }

        const senderWallet = await tx.wallet.findUnique({ where: { userId: sId } });
        if (!senderWallet)  {
            const error =  new Error("Sender wallet not found");
error.statusCode = 404;
        throw  error;
    }
        if (parseFloat(senderWallet.realBalance) < amount) {
             const error =  new Error("Insufficient balance");
                error.statusCode = 400;
        throw  error;
    }

        const receiverWallet = await tx.wallet.findUnique({ where: { userId: rId } });
        if (!receiverWallet)  {
            const error =  new Error("Receiver wallet not found");
        error.statusCode = 404;
        throw  error;
   }
        const updatedSenderWallet = await tx.wallet.update({
            where: { userId: sId },
            data: { realBalance: { decrement: amount } }
        });
        await tx.transaction.create({
            data: {
                walletId: sId,
                amount: amount,
                type: TransactionType.DEBIT,
                category: TransactionCategory.TRANSFER,
                idempotencyKey: idempotencyKey,
                description: `Transfer to User ${receiverId}: ${description}`,
                referenceId: `TRF-OUT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

            }
        });

        await tx.wallet.update({
            where: { userId: rId },
            data: { realBalance: { increment: amount } }
        });

        await tx.transaction.create({
            data: {
                walletId: rId,
                amount: amount,
                type: TransactionType.CREDIT,
                category: TransactionCategory.TRANSFER,
                idempotencyKey: idempotencyKey ? `${idempotencyKey}-RS` : null,
                description: `Transfer from User ${senderId}: ${description}`,
                referenceId: `TRF-IN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

            }
        });

        return { success: true, wallet: updatedSenderWallet };
    });
};

export const getTransactionHistory = async (userId) => {
    const uId = parseInt(userId);
    return await prisma.transaction.findMany({
        where: { walletId: uId },
        orderBy: { createdAt: 'desc' },
    });
};

export const getWalletByUserId = async (userId) => {
    const uId = parseInt(userId);
    return await prisma.wallet.findUnique({
        where: { userId: uId },
        include: {
            transactions: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            }
        }
    });
};


export const getAllWallets = async () => {

    return await prisma.wallet.findMany({
        include: {
            user: {
                select: {
                    email: true
                }
            }
        }
    });
};


