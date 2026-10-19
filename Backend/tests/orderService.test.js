import { jest } from '@jest/globals';

// 1. Setup Prisma Mocks
const mockPrismaProductFindMany = jest.fn();
const mockTxWalletFindUnique = jest.fn();
const mockTxOrderCreate = jest.fn();
const mockTxWalletUpdate = jest.fn();
const mockTxTransactionCreate = jest.fn();
const mockTxProductUpdate = jest.fn();
const mockTxTransactionFindUnique = jest.fn();

// Mock the Prisma client, specifically handling the complex $transaction callback
jest.unstable_mockModule('../src/config/prisma.js', () => ({
    default: {
        product: { findMany: mockPrismaProductFindMany },
        $transaction: jest.fn(async (callback) => {
            // Execute the callback immediately with our mocked transaction object (tx)
            return await callback({
                wallet: { 
                    findUnique: mockTxWalletFindUnique, 
                    update: mockTxWalletUpdate 
                },
                order: { create: mockTxOrderCreate },
                transaction: { create: mockTxTransactionCreate,
                    findUnique:mockTxTransactionFindUnique
                 },
                product: { update: mockTxProductUpdate }
            });
        })
    }
}));

// Dynamically import the service AFTER the mocks are established
const { processOrder } = await import('../src/services/orderService.js');

describe('Order Service - Critical Business Logic', () => {

    beforeEach(() => {
        jest.clearAllMocks();
          mockTxTransactionFindUnique.mockResolvedValue(null);
    });

    it('CRITICAL: Should consolidate duplicate cart items and calculate correct totals', async () => {
        // Arrange
        const buyerId = 1;
        // Frontend sends a buggy/malicious cart with split duplicates
        const rawItems = [
            { productId: 10, quantity: 2 },
            { productId: 10, quantity: 3 } 
        ];

        // Mock the product lookup to return our single product
        mockPrismaProductFindMany.mockResolvedValue([
            { id: 10, name: 'Headphones', price: 100, isHidden: false }
        ]);

        // Mock the wallet lookup to have plenty of money ($1000)
        mockTxWalletFindUnique.mockResolvedValue({
            userId: buyerId,
            realBalance: 1000 
        });

        // Mock the order creation to return a dummy order
        mockTxOrderCreate.mockResolvedValue({ id: 999 });

        // Act
        await processOrder(buyerId, rawItems, 'test-key-1');

        // Assert
        // 1. It should only look up 1 unique product ID, not 2
        expect(mockPrismaProductFindMany).toHaveBeenCalledWith({
            where: { id: { in: [10] }, isHidden: false }
        });

        // 2. The order creation should consolidate to qty: 5 and total 500
        expect(mockTxOrderCreate).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                totalAmount: 500, // 5 items * $100
                items: {
                    create: [
                        { productId: 10, quantity: 5, priceAtPurchase: 100 }
                    ]
                }
            })
        }));
    });

    it('CRITICAL: Should reject the order if any product does not exist in the database', async () => {
        // Arrange
        const rawItems = [
            { productId: 1, quantity: 1 },
            { productId: 99, quantity: 1 } // Ghost product
        ];

        // Database only returns product 1
        mockPrismaProductFindMany.mockResolvedValue([
            { id: 1, name: 'Valid Item', price: 50, isHidden: false }
        ]);

        // Act & Assert
        await expect(processOrder(1, rawItems, 'test-key-2'))
            .rejects
            .toThrow("One or more products are unavailable or do not exist.");
            
        // Ensure the transaction never even started
        expect(mockTxOrderCreate).not.toHaveBeenCalled();
    });

    it('CRITICAL: Should rollback/reject if wallet balance is lower than total cart amount', async () => {
        // Arrange
        const rawItems = [
            { productId: 5, quantity: 2 }
        ];

        mockPrismaProductFindMany.mockResolvedValue([
            { id: 5, name: 'Expensive Item', price: 500, isHidden: false } // Total cost will be 1000
        ]);

        // Mock wallet with only $100 (Insufficient!)
        mockTxWalletFindUnique.mockResolvedValue({
            userId: 1,
            realBalance: 100 
        });

        // Act & Assert
        await expect(processOrder(1, rawItems, 'test-key-3'))
            .rejects
            .toThrow("Insufficient wallet balance to complete this purchase.");
            
        // Ensure money was NEVER deducted
        expect(mockTxWalletUpdate).not.toHaveBeenCalled();
    });

    it('Should throw error if idempotency key is missing', async () => {
        await expect(processOrder(1, [{ productId: 1, quantity: 1 }], null))
            .rejects
            .toThrow("Invalid input: idempotency key is required.");
    });

    it('Should return already processed order if idempotency key exists', async () => {
        const rawItems = [{ productId: 10, quantity: 1 }];
        const existingOrder = { id: 888, totalAmount: 100, status: 'PAID' };

        mockPrismaProductFindMany.mockResolvedValue([
            { id: 10, name: 'Headphones', price: 100, isHidden: false }
        ]);

        mockTxTransactionFindUnique.mockResolvedValueOnce({
            id: 1,
            idempotencyKey: 'test-dup-key',
            order: existingOrder
        });

        const result = await processOrder(1, rawItems, 'test-dup-key');

        expect(result.id).toBe(888);
        expect(result.alreadyProcessed).toBe(true);
        expect(mockTxOrderCreate).not.toHaveBeenCalled();
    });

    it('Should catch P2002 race condition on concurrent processOrder and return existing order', async () => {
        const rawItems = [{ productId: 10, quantity: 1 }];
        const existingOrder = { id: 888, totalAmount: 100, status: 'PAID' };

        mockPrismaProductFindMany.mockResolvedValue([
            { id: 10, name: 'Headphones', price: 100, isHidden: false }
        ]);
        mockTxWalletFindUnique.mockResolvedValue({
            userId: 1,
            realBalance: 1000
        });
        mockTxOrderCreate.mockResolvedValue({ id: 888 });

        // First check sees nothing
        mockTxTransactionFindUnique.mockResolvedValueOnce(null);

        // Transaction create throws P2002
        mockTxTransactionCreate.mockImplementationOnce(() => {
            const err = new Error('Unique constraint failed on the fields: (idempotencyKey)');
            err.code = 'P2002';
            err.meta = { target: ['idempotencyKey'] };
            throw err;
        });

        // Re-fetch sees existing order
        mockTxTransactionFindUnique.mockResolvedValueOnce({
            id: 1,
            idempotencyKey: 'test-race-key',
            order: existingOrder
        });

        const result = await processOrder(1, rawItems, 'test-race-key');

        expect(result.id).toBe(888);
        expect(result.alreadyProcessed).toBe(true);
    });
});
