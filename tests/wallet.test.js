import { jest } from '@jest/globals';

const mockFindUniqueTx = jest.fn();
const mockCreateTx = jest.fn();
const mockFindUniqueWallet = jest.fn();
const mockUpdateWallet = jest.fn();

jest.unstable_mockModule('../src/config/prisma.js', () => ({
  default: {
    $transaction: jest.fn(async (callback) => {
      return await callback({
        transaction: {
          findUnique: mockFindUniqueTx,
          create: mockCreateTx,
        },
        wallet: {
          findUnique: mockFindUniqueWallet,
          update: mockUpdateWallet,
        },
      });
    }),
    wallet: { findUnique: mockFindUniqueWallet, update: mockUpdateWallet },
    transaction: { findUnique: mockFindUniqueTx }
  },
}));

const { transferFunds, depositToWallet ,withdrawFromWallet} = await import('../src/services/walletService.js');

describe('Wallet Service Unit Tests (FR-17)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Insufficient Balance
  test('Should throw error if sender has insufficient balance', async () => {
    mockFindUniqueTx.mockResolvedValue(null); 
    mockFindUniqueWallet.mockResolvedValueOnce({ userId: 1, realBalance: 50 });

    await expect(transferFunds(1, 2, 100, "Gift", "key-1"))
      .rejects.toThrow('Insufficient balance');
  });

  // Test 2: Idempotency (Duplicate Prevention)
  test('Should return alreadyProcessed if idempotency key exists', async () => {
    mockFindUniqueTx.mockResolvedValueOnce({ 
      id: 99, 
      idempotencyKey: "key-1",
      wallet: { userId: 1, realBalance: 500 }
    });

    const result = await depositToWallet(1, 100, "Deposit", "key-1");
    
    expect(result.alreadyProcessed).toBe(true);
    expect(result.wallet.realBalance).toBe(500);
    expect(mockUpdateWallet).not.toHaveBeenCalled();
  });

// Test 3 rollback

test('Should rollback changes if an error occurs during transfer (ACID check)', async () => {
  mockFindUniqueTx.mockResolvedValue(null); 
  mockFindUniqueWallet.mockResolvedValue({ userId: 1, realBalance: 500 }); 
  
  
  mockUpdateWallet
    .mockResolvedValueOnce({ userId: 1, realBalance: 400 }) 
    .mockRejectedValueOnce(new Error("Database Crash during deposit!")); 

  await expect(transferFunds(1, 2, 100, "Test Rollback", "key-error"))
    .rejects.toThrow("Database Crash during deposit!");

  expect(mockUpdateWallet).toHaveBeenCalledTimes(2); 
});

  // Test 4: Input Validation (parseInt)
  test('Should handle string IDs correctly using parseInt', async () => {
    mockFindUniqueTx.mockResolvedValue(null);
    mockFindUniqueWallet.mockResolvedValue({ userId: 1, realBalance: 500 });
    mockUpdateWallet.mockResolvedValue({ userId: 1, realBalance: 400 });

    await transferFunds("1", "2", 100, "Test", "key-unique");

    expect(mockFindUniqueWallet).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 1 } 
    }));
  });

  test('Should throw error if wallet does not exist', async () => {
  mockFindUniqueWallet.mockResolvedValueOnce(null);
  await expect(withdrawFromWallet(999, 100, "Withdraw", "key-999"))
    .rejects.toThrow('Wallet not found');
});

test('Should successfully deposit and call update with correct values', async () => {
  mockFindUniqueTx.mockResolvedValue(null); 
  mockUpdateWallet.mockResolvedValue({ userId: 1, realBalance: 200 }); 

  await depositToWallet(1, 100, "Bonus", "new-key");

  expect(mockUpdateWallet).toHaveBeenCalledWith(expect.objectContaining({
    data: { realBalance: { increment: 100 } }
  }));
});

test('Should throw error for zero or negative amount', async () => {
  await expect(depositToWallet(1, 0, "Fake", "key"))
    .rejects.toThrow('Invalid amount');
    
  await expect(depositToWallet(1, -50, "Fake", "key"))
    .rejects.toThrow('Invalid amount');
});

});