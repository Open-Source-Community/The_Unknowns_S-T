import prisma from '../config/prisma.js'
import crypto from 'crypto' // for genetating refrenceId
import { TransactionType, TransactionCategory } from '../data/constants.js';

const checkIdempotency = async (tx, idempotencyKey) => {
    if (!idempotencyKey) return null;
    return await tx.transaction.findUnique({
        where: { idempotencyKey: idempotencyKey },
        include:{wallet:true}
    });
};

// deposit
export const depositToWallet = async (userId, amount, description, idempotencyKey) => {
    if (!amount || amount <= 0) {
        throw new Error("Invalid amount. The deposited amount must be greater than zero.");
    }
    const uId = parseInt(userId)

const userExists = await prisma.user.findUnique({
        where: { id: uId },
        include: { wallet: true }
    });

    if (!userExists) {
        throw new Error("User does not exist in the system.");
    }
    if (!userExists.wallet) {
        throw new Error("User found, but no wallet is associated with this account.");
    }

    return await prisma.$transaction(async (tx) => {

        const existing = await checkIdempotency(tx, idempotencyKey);
        if (existing) return { 
            success: true, 
            alreadyProcessed: true,
        wallet:existing.wallet
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
        return updatedWallet;
    });
};


// withdraw

export const withdrawFromWallet = async (userId, amount, description, idempotencyKey) => {
    if (!amount || amount <= 0) {
        throw new Error("Invalid amount. The withdrawn amount must be greater than zero.");
    }
    const uId = parseInt(userId);
const userExists = await prisma.user.findUnique({
        where: { id: uId },
        include: { wallet: true }
    });

    if (!userExists) {
        throw new Error("User does not exist in the system.");
    }
    if (!userExists.wallet) {
        throw new Error("User found, but no wallet is associated with this account.");
    }
    return await prisma.$transaction(async (tx) => {
        const existing = await checkIdempotency(tx, idempotencyKey);
          if (existing) return { 
            success: true, 
            alreadyProcessed: true,
        wallet:existing.wallet
        };

        const wallet = await tx.wallet.findUnique({
            where: { userId: uId },
        });
        // Check 1: Existence
        if (!wallet) {
            throw new Error("Wallet not found for this user");
        }
        // Check 2: Balance
        if (parseFloat(wallet.realBalance) < amount) {
            throw new Error("Insufficient balance: You don't have enough funds");
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
        return updatedWallet;
    });

};

// transfer funds
export const transferFunds = async (senderId, receiverId, amount, description, idempotencyKey) => {
    if (!amount || amount <= 0) {
        throw new Error("Invalid amount. The transferred amount must be greater than zero.");
    }
const sId = parseInt(senderId);
  const rId = parseInt(receiverId);

  if (isNaN(sId) || isNaN(rId)) {
    throw new Error("Invalid User IDs");
  }
    return await prisma.$transaction(async (tx) => {

        if (idempotencyKey) {
            const existingTx = await checkIdempotency(tx, idempotencyKey);
            if (existingTx) {
                return { success: true, message: "Duplicate request ignored",
                     alreadyProcessed: true,
                    wallet:existingTx.wallet,
                    };
            }
        }

        const senderWallet = await tx.wallet.findUnique({ where: { userId: sId } });
        if (!senderWallet) throw new Error("Sender wallet not found");

        if (parseFloat(senderWallet.realBalance) < amount) {
            throw new Error("Insufficient balance");
        }

        const receiverWallet = await tx.wallet.findUnique({ where: { userId: rId } });
        if (!receiverWallet) throw new Error("Receiver wallet not found");

const updatedSenderWallet = await tx.wallet.update({
            where: { userId: sId },
            data: { realBalance: { decrement: amount } }
        });
        await tx.transaction.create({
            data: {
                walletId: sId,
                amount:-amount,
                type: TransactionType.DEBIT,
                category: TransactionCategory.TRANSFER,
                idempotencyKey:idempotencyKey,
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
                amount:amount,
                type: TransactionType.CREDIT,
                category: TransactionCategory.TRANSFER,
                idempotencyKey: `${idempotencyKey}-RS`,
                description: `Transfer from User ${senderId}: ${description}`,
                referenceId: `TRF-IN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

            }
        });

       return { 
            wallet: updatedSenderWallet 
        };
    });
};

export const getTransactionHistory = async (userId) => {
    const uId = parseInt(userId);
    return await prisma.transaction.findMany({
        where: { walletId: parseInt(uId) },
        orderBy: { createdAt: 'desc' },
    });
};

export const getWalletByUserId = async (userId) => {
      const uId = parseInt(userId);
    return await prisma.wallet.findUnique({
        where: { userId: parseInt(uId) },
        include: {
            transactions: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            }
        }
    });
};
