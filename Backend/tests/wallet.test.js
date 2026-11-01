import { jest } from '@jest/globals';

const mockFindUniqueTx = jest.fn();
const mockCreateTx = jest.fn();
const mockFindUniqueWallet = jest.fn();
const mockUpdateWallet = jest.fn();
const mockFindUniqueUser = jest.fn();
const mockFindTransactions = jest.fn();
const mockFindManyWallets = jest.fn();

// 1. Mock the Prisma module securely
jest.unstable_mockModule('../src/config/prisma.js', () => ({
  default: {
    $transaction: jest.fn(async (callback) => {
      return await callback({
        transaction: { findUnique: mockFindUniqueTx, create: mockCreateTx },
        wallet: { findUnique: mockFindUniqueWallet, update: mockUpdateWallet, findMany: mockFindManyWallets },
      });
    }),
    user: { findUnique: mockFindUniqueUser },
    wallet: { findUnique: mockFindUniqueWallet, update: mockUpdateWallet, findMany: mockFindManyWallets },
    transaction: { findUnique: mockFindUniqueTx, findMany: mockFindTransactions }
  },
}));

// 2. Import service after mocks
const { transferFunds, depositToWallet, withdrawFromWallet, getTransactionHistory, getWalletByUserId } = await import('../src/services/walletService.js');

// ─── Wallet Service Unit Tests ───────────────────────────────────────────

describe('Wallet Service Unit Tests (FR-17)', () => {

  beforeEach(() => {
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

  test('Should catch P2002 collision during concurrent deposit and return alreadyProcessed: true', async () => {
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockCreateTx.mockImplementationOnce(() => {
      const error = new Error('Unique constraint failed on the fields: (idempotencyKey)');
      error.code = 'P2002';
      error.meta = { target: ['idempotencyKey'] };
      throw error;
    });
    mockFindUniqueTx.mockResolvedValueOnce({
      id: 99,
      idempotencyKey: "race-key-1",
      wallet: { userId: 1, realBalance: 500 }
    });

    mockFindUniqueUser.mockResolvedValueOnce({ id: 1, wallet: { userId: 1 } });
    const result = await depositToWallet(1, 100, "Deposit", "race-key-1");

    expect(result.alreadyProcessed).toBe(true);
    expect(result.wallet.realBalance).toBe(500);
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

// ─── validateIdempotency, validateWalletFilters, validateTransactionFilters  Middlewares ───────────────────────────────────────────

const { validateIdempotency, validateWalletFilters, validateTransactionFilters, validatePagination } = await import('../src/middlewares/walletMiddleware.js');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
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


// ─── Traking New Wallet Service Unit Tests (Filters & Pagination) ────────

describe('Wallet Service Pagination & Filtration Tests', () => {

  beforeEach(() => {
    mockFindTransactions.mockReset();
    mockFindUniqueWallet.mockReset();
    mockFindTransactions.mockReset();
  });

  test('getTransactionHistory should apply type and date filters correctly', async () => {
    const filters = {
      type: 'Credit',
      startDate: '2026-01-01',
      endDate: '2026-01-31'
    };

    mockFindTransactions.mockResolvedValueOnce([]);

    await getTransactionHistory(1, 0, 10, filters);

    expect(mockFindTransactions).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        walletId: 1,
        type: 'Credit',
        createdAt: {
          gte: expect.any(Date),
          lte: expect.any(Date)
        }
      }
    }));
  });

  test('getAllWallets should apply balance filters and include user email (N+1 Fix)', async () => {
    const filters = { minBalance: 100, maxBalance: 500 };
    const mockWallets = [{ id: 1, realBalance: 200, user: { email: 'test@test.com' } }];

    mockFindManyWallets.mockReset();
    mockFindManyWallets.mockResolvedValueOnce(mockWallets);

    const { getAllWallets } = await import('../src/services/walletService.js');

    await getAllWallets(0, 10, filters);

    expect(mockFindManyWallets).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        realBalance: { gte: 100, lte: 500 }
      },
      include: {
        user: { select: { email: true } }
      }
    }));
  });
});

// ─── New Middleware Validation Tests (Wallet & Transaction Filters) ──────

describe('Wallet & Transaction Filter Middlewares', () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  describe('validatePagination', () => {
    test('Should reject if skip is negative', () => {
      const req = { query: { skip: '-1', take: '10' } };
      const res = mockRes();

      validatePagination(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Invalid skip value')
      }));
    });

    test('Should reject if take is negative', () => {
      const req = { query: { skip: '0', take: '-5' } };
      const res = mockRes();

      validatePagination(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Invalid take value')
      }));
    });

    test('Should reject if take exceeds 100', () => {
      const req = { query: { take: '150' } };
      const res = mockRes();

      validatePagination(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Invalid take value')
      }));
    });

    test('Should pass with valid skip and take', () => {
      const req = { query: { skip: '5', take: '20' } };
      const res = mockRes();

      validatePagination(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.query.skip).toBe(5);
      expect(req.query.take).toBe(20);
    });

    test('Should pass when skip and take are empty strings or omitted', () => {
      const req = { query: { skip: '', take: '' } };
      const res = mockRes();

      validatePagination(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateWalletFilters', () => {
    test('Should reject if minBalance > maxBalance', () => {
      const req = { query: { minBalance: '500', maxBalance: '100' } };
      const res = mockRes();

      validateWalletFilters(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: "minBalance cannot be greater than maxBalance."
      }));
    });

    test('Should reject if minBalance is negative', () => {
      const req = { query: { minBalance: '-10' } };
      const res = mockRes();

      validateWalletFilters(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Invalid minBalance value')
      }));
    });

    test('Should pass with valid optional filters', () => {
      const req = { query: { minBalance: '10' } };
      const res = mockRes();

      validateWalletFilters(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('Should pass when minBalance and maxBalance are empty strings', () => {
      const req = { query: { minBalance: '', maxBalance: '' } };
      const res = mockRes();

      validateWalletFilters(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateTransactionFilters', () => {
    test('Should reject invalid transaction type', () => {
      const req = { query: { type: 'INVALID_ENUM' } };
      const res = mockRes();

      validateTransactionFilters(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Allowed values')
      }));
    });

    test('Should reject if startDate is after endDate', () => {
      const req = { query: { startDate: '2026-05-01', endDate: '2026-01-01' } };
      const res = mockRes();

      validateTransactionFilters(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: "startDate must be before endDate."
      }));
    });

    test('Should pass with valid date format', () => {
      const req = { query: { startDate: '2026-01-01' } };
      const res = mockRes();

      validateTransactionFilters(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

