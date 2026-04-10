import { jest } from '@jest/globals';

const mockFindUniqueTx = jest.fn();
const mockCreateTx = jest.fn();
const mockFindUniqueWallet = jest.fn();
const mockUpdateWallet = jest.fn();
const mockFindUniqueUser = jest.fn();
const mockFindTransactions = jest.fn();

// 1. Mock the Prisma module securely
jest.unstable_mockModule('../src/config/prisma.js', () => ({
  default: {
    $transaction: jest.fn(async (callback) => {
      return await callback({
        transaction: { findUnique: mockFindUniqueTx, create: mockCreateTx },
        wallet: { findUnique: mockFindUniqueWallet, update: mockUpdateWallet },
      });
    }),
    user: { findUnique: mockFindUniqueUser },
    wallet: { findUnique: mockFindUniqueWallet, update: mockUpdateWallet },
    transaction: { findUnique: mockFindUniqueTx, findMany: mockFindTransactions }
  },
}));

// 2. Import service after mocks
const { transferFunds, depositToWallet, withdrawFromWallet, getTransactionHistory, getWalletByUserId } = await import('../src/services/walletService.js');

// ─── Wallet Service Unit Tests ───────────────────────────────────────────

describe('Wallet Service Unit Tests (FR-17)', () => {

  beforeEach(() => {
    // CRITICAL FIX: Explicitly reset the inner mocks to clear return values from previous tests,
    // while leaving the outer $transaction wrapper completely intact!
    mockFindUniqueTx.mockReset();
    mockCreateTx.mockReset();
    mockFindUniqueWallet.mockReset();
    mockUpdateWallet.mockReset();
    mockFindUniqueUser.mockReset();
    mockFindTransactions.mockReset();
  });

  test('Should throw error if sender has insufficient balance', async () => {
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockFindUniqueWallet.mockResolvedValueOnce({ userId: 1, realBalance: 50 });

    await expect(transferFunds(1, 2, 100, "Gift", "key-1"))
      .rejects.toThrow('Insufficient balance');
  });

  test('Should return alreadyProcessed for Deposit if idempotency key exists', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({ id: 1, wallet: { userId: 1 } });
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

  test('Should return alreadyProcessed for withdraw if idempotency key exists', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({ id: 1, wallet: { userId: 1 } });
    mockFindUniqueTx.mockResolvedValueOnce({
      id: 1,
      idempotencyKey: "key-1",
      wallet: { userId: 1, realBalance: 500 }
    });
    mockFindUniqueWallet.mockResolvedValueOnce({ userId: 1, realBalance: 500 });

    const result = await withdrawFromWallet(1, 100, "withdraw", "key-1");

    expect(result.alreadyProcessed).toBe(true);
    expect(result.wallet.realBalance).toBe(500);
  });

  test('Should return alreadyProcessed for Transfer if idempotency key exists', async () => {
    mockFindUniqueTx.mockResolvedValueOnce({
      id: 1,
      idempotencyKey: "key-1",
      wallet: { userId: 1, realBalance: 500 }
    });
    
    const result = await transferFunds(1, 2, 100, "Transfer", "key-1");

    expect(result.alreadyProcessed).toBe(true);
    expect(mockUpdateWallet).not.toHaveBeenCalled();
  });

  test('Should handle string IDs correctly using parseInt', async () => {
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockFindUniqueWallet.mockResolvedValueOnce({ userId: 1, realBalance: 500 });
    mockFindUniqueWallet.mockResolvedValueOnce({ userId: 2, realBalance: 100 });
    mockUpdateWallet.mockResolvedValue({ userId: 1, realBalance: 400 });
    mockCreateTx.mockResolvedValue({});

    await transferFunds("1", "2", 100, "Test", "key-unique");

    expect(mockFindUniqueWallet).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 1 }
    }));
  });

  test('Should fall through to User Check for zero or negative amount for deposit', async () => {
    mockFindUniqueUser.mockResolvedValueOnce(null);
    await expect(depositToWallet(1, 0, "Fake", "key"))
      .rejects.toThrow('User does not exist in the system.');
  });
  
  test('Should fall through to User Check for zero or negative amount for withdraw', async () => {
    mockFindUniqueUser.mockResolvedValueOnce(null);
    await expect(withdrawFromWallet(1, 0, "Fake", "key"))
      .rejects.toThrow('User does not exist in the system.');
  });

  test('Should fall through to Wallet Check if transfer amount is invalid', async () => {
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockFindUniqueWallet.mockResolvedValueOnce(null); 

    await expect(transferFunds(1, 2, -100, "Gift", "key-1"))
      .rejects.toThrow('Sender wallet not found');
  });

  test('Should successfully deposit and call update with correct values', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({ id: 1, wallet: { userId: 1 } });
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockUpdateWallet.mockResolvedValueOnce({ userId: 1, realBalance: 200 });
    mockCreateTx.mockResolvedValue({});

    await depositToWallet(1, 100, "Bonus", "new-key");

    expect(mockUpdateWallet).toHaveBeenCalledWith(expect.objectContaining({
      data: { realBalance: { increment: 100 } }
    }));
  });

  test('Should throw error if user has insufficient balance for withdrawal', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({ id: 1, wallet: { userId: 1 } });
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockFindUniqueWallet.mockResolvedValueOnce({ userId: 1, realBalance: 200 });
    
    await expect(withdrawFromWallet(1, 500, "try", "key-1"))
      .rejects.toThrow('Insufficient balance');
  });

  test('Should throw error if receiver wallet does not exist', async () => {
    mockFindUniqueTx.mockResolvedValueOnce(null);
    // Sender passes, receiver fails
    mockFindUniqueWallet.mockResolvedValueOnce({ userId: 1, realBalance: 500 });
    mockFindUniqueWallet.mockResolvedValueOnce(null);

    await expect(transferFunds(1, 2, 100, "Gift", "key-recv"))
      .rejects.toThrow('Receiver wallet not found');
  });

  test('Should successfully withdraw and return updated wallet', async () => {
      mockFindUniqueUser.mockResolvedValueOnce({ id: 1, wallet: { userId: 1 } });
      mockFindUniqueTx.mockResolvedValueOnce(null);
      mockFindUniqueWallet.mockResolvedValueOnce({ userId: 1, realBalance: 200 });
      mockUpdateWallet.mockResolvedValueOnce({ userId: 1, realBalance: 100 });
      mockCreateTx.mockResolvedValue({});

      const result = await withdrawFromWallet(1, 100, "try", "key-1");
      expect(result.success).toBe(true);
      expect(result.wallet.realBalance).toBe(100);
  });
  
  test('Should get All transaction history for the user', async () => {
    mockFindTransactions.mockResolvedValueOnce([
      { id: 1, amount: 100, type: 'CREDIT' },
      { id: 2, amount: 50, type: 'DEBIT' },
    ]);
    const result = await getTransactionHistory("1");

    expect(result).toEqual([
      { id: 1, amount: 100, type: 'CREDIT' },
      { id: 2, amount: 50, type: 'DEBIT' },
    ]);
  });
});

// ─── validateIdempotency Middleware ───────────────────────────────────────────

const { validateIdempotency } = await import('../src/middlewares/walletMiddleware.js');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe('validateIdempotency middleware', () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  test('Should reject deposit request with no idempotency-key header', () => {
    const req = { headers: {} };
    const res = mockRes();

    validateIdempotency(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('Should reject withdraw request with no idempotency-key header', () => {
    const req = { headers: {} };
    const res = mockRes();

    validateIdempotency(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('Should reject transfer request with no idempotency-key header', () => {
    const req = { headers: {} };
    const res = mockRes();

    validateIdempotency(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('Should call next() when idempotency-key header is present', () => {
    const req = { headers: { 'idempotency-key': 'key-abc-123' } };
    const res = mockRes();

    validateIdempotency(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('Should include correct error message when key is missing', () => {
    const req = { headers: {} };
    const res = mockRes();

    validateIdempotency(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('unique request ID'),
      })
    );
  });
});
