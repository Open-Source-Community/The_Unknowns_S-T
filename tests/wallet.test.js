import { jest } from '@jest/globals';

const mockFindUniqueTx = jest.fn();
const mockCreateTx = jest.fn();
const mockFindUniqueWallet = jest.fn();
const mockUpdateWallet = jest.fn();
const mockFindUniqueUser = jest.fn();
const mockFindTransactions = jest.fn();


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
    user: { findUnique: mockFindUniqueUser },
    wallet: { findUnique: mockFindUniqueWallet, update: mockUpdateWallet },
    transaction: {
      findUnique: mockFindUniqueTx,
      findMany: mockFindTransactions,
    }
  },
}));

const { transferFunds, depositToWallet, withdrawFromWallet, getTransactionHistory, getWalletByUserId } = await import('../src/services/walletService.js');
const prisma = (await import('../src/config/prisma.js')).default;

// ─── Wallet Service Unit Tests ───────────────────────────────────────────

describe('Wallet Service Unit Tests (FR-17)', () => {

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(async (callback) => {
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
    });
  });
  // Test 1: Insufficient Balance
  test('Should throw error if sender has insufficient balance', async () => {
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockFindUniqueWallet.mockResolvedValueOnce({ userId: 1, realBalance: 50 });

    await expect(transferFunds(1, 2, 100, "Gift", "key-1"))
      .rejects.toThrow('Insufficient balance');
  });

  // Test 2: Idempotency (Duplicate Prevention)
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

  // Test 2: Idempotency (Duplicate Prevention)
  test('Should return alreadyProcessed for withdraw if idempotency key exists', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({ id: 1, wallet: { userId: 1 } });
    mockFindUniqueTx.mockResolvedValueOnce({
      id: 1,
      idempotencyKey: "key-1",
      wallet: { userId: 1, realBalance: 500 }
    });
    mockFindUniqueWallet.mockResolvedValueOnce({
      userId: 1, realBalance: 500
    });


    const result = await withdrawFromWallet(1, 100, "withdraw", "key-1");

    expect(result.alreadyProcessed).toBe(true);
    expect(result.wallet.realBalance).toBe(500);
    expect(mockUpdateWallet).not.toHaveBeenCalled();
  });

  // Test 2: Idempotency (Duplicate Prevention)
  test('Should return alreadyProcessed for Transfer if idempotency key exists', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({ id: 1, wallet: { userId: 1 } });
    mockFindUniqueTx.mockResolvedValueOnce({
      id: 1,
      idempotencyKey: "key-1",
      wallet: { userId: 1, realBalance: 500 }
    });
    mockFindUniqueWallet
      .mockResolvedValueOnce({ userId: 1, realBalance: 500 })
      .mockResolvedValueOnce({ userId: 2, realBalance: 100 });

    mockCreateTx.mockResolvedValueOnce({});

    const result = await transferFunds(1, 2, 100, "Transfer", "key-1");

    expect(result.alreadyProcessed).toBe(true);
    expect(result.wallet.realBalance).toBe(500);
    expect(mockUpdateWallet).not.toHaveBeenCalled();
  });


  test('Should propagate error and not complete transfer if receiver update fails', async () => {
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockFindUniqueWallet
      .mockResolvedValueOnce({ userId: 1, realBalance: 500 })
      .mockResolvedValueOnce({ userId: 2, realBalance: 100 });

    mockCreateTx.mockResolvedValueOnce({});

    mockUpdateWallet
      .mockResolvedValueOnce({ userId: 1, realBalance: 400 })
      .mockRejectedValueOnce(new Error("Database Crash during deposit!"));

    await expect(transferFunds(1, 2, 100, "Test Rollback", "key-error"))
      .rejects.toThrow("Database Crash during deposit!");

    expect(mockUpdateWallet).toHaveBeenCalledTimes(2);
  });

  // Test 4: Input Validation (parseInt)
  test('Should handle string IDs correctly using parseInt', async () => {
    mockFindUniqueTx.mockResolvedValueOnce(null);

    mockFindUniqueWallet.mockResolvedValueOnce({ userId: 1, realBalance: 500 });
    mockFindUniqueWallet.mockResolvedValueOnce({ userId: 2, realBalance: 100 });

    mockUpdateWallet.mockResolvedValueOnce({ userId: 1, realBalance: 400 });
    mockUpdateWallet.mockResolvedValueOnce({ userId: 2, realBalance: 200 });

    mockCreateTx.mockResolvedValueOnce({});
    mockCreateTx.mockResolvedValueOnce({});


    await transferFunds("1", "2", 100, "Test", "key-unique");

    expect(mockFindUniqueWallet).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 1 }
    }));
  });

  test('Should throw error if wallet does not exist', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({
      id: 999,
      wallet: { userId: 999 }
    });
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockFindUniqueWallet.mockResolvedValueOnce(null);
    await expect(withdrawFromWallet(999, 100, "Withdraw", "key-999"))
      .rejects.toThrow('Wallet not found');
  });

  test('Should successfully deposit and call update with correct values', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({
      id: 1,
      wallet: { userId: 1 }
    });
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockUpdateWallet.mockResolvedValueOnce({ userId: 1, realBalance: 200 });
    mockCreateTx.mockResolvedValueOnce({});

    await depositToWallet(1, 100, "Bonus", "new-key");

    expect(mockUpdateWallet).toHaveBeenCalledWith(expect.objectContaining({
      data: { realBalance: { increment: 100 } }
    }));
  });

  test('Should throw error for zero or negative amount for deposit', async () => {
    await expect(depositToWallet(1, 0, "Fake", "key"))
      .rejects.toThrow('Invalid amount');

    await expect(depositToWallet(1, -50, "Fake", "key"))
      .rejects.toThrow('Invalid amount');
  });

  test('Should throw error for zero or negative amount for withdraw', async () => {
    await expect(withdrawFromWallet(1, 0, "Fake", "key"))
      .rejects.toThrow('Invalid amount');

    await expect(withdrawFromWallet(1, -50, "Fake", "key"))
      .rejects.toThrow('Invalid amount');
  });


  test('Should get All transaction history for the user', async () => {
    mockFindTransactions.mockResolvedValueOnce([
      { id: 1, amount: 100, type: 'CREDIT' },
      { id: 2, amount: 50, type: 'DEBIT' },
    ]);
    const result = await getTransactionHistory("1");

    expect(result).toEqual(
      [
        { id: 1, amount: 100, type: 'CREDIT' },
        { id: 2, amount: 50, type: 'DEBIT' },
      ]
    );
    expect(result.length).toBe(2);
    expect(mockFindTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { walletId: 1 }
      })
    );

  });


  test('Should get current wallet info for the user', async () => {
    const walletData = {
      userId: 1, realBalance: 50,
      transactions: [{ id: 1, amount: 100, type: 'Transfer', },
      { id: 1, amount: 200, type: 'Transfer', },
      { id: 1, amount: 300, type: 'Transfer', },
      ]
    };

    mockFindUniqueWallet.mockResolvedValueOnce(

      walletData
    );

    const result = await getWalletByUserId("1");

    expect(result).toEqual(
      walletData
    );
    expect(result.transactions.length).toBe(3);
    expect(mockFindUniqueWallet).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 1 }
      })
    );

  });


  test('Should successfully withdraw and return updated wallet', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({
      id: 1,
      wallet: { userId: 1 }
    });
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockFindUniqueWallet.mockResolvedValueOnce({
      userId: 1, realBalance: 200
    });
    mockUpdateWallet.mockResolvedValueOnce({ userId: 1, realBalance: 100 });
    mockCreateTx.mockResolvedValueOnce({});

    const result = await withdrawFromWallet(1, 100, "try", "key-1")
    expect(result.success).toBe(true);
    expect(result.wallet.realBalance).toBe(100);
    expect(mockUpdateWallet).toHaveBeenCalled();

  });



  test('Should throw error if user has insufficient balance', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({
      id: 1,
      wallet: { userId: 1 }
    });
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockFindUniqueWallet.mockResolvedValueOnce({
      userId: 1, realBalance: 200
    });
    mockUpdateWallet.mockResolvedValueOnce({ userId: 1, realBalance: 100 });
    mockCreateTx.mockResolvedValueOnce({});
    await expect(withdrawFromWallet(1, 500, "try", "key-1"))
      .rejects.toThrow('Insufficient balance');
  });


  test('Should throw error if sender enter ivalid amount', async () => {
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockFindUniqueWallet.mockResolvedValueOnce({ userId: 1, realBalance: 50 });

    await expect(transferFunds(1, 2, -100, "Gift", "key-1"))
      .rejects.toThrow('Invalid amount. The transferred amount must be greater than zero.');
  });


  test('Should throw if user does not exist for deposit', async () => {
    mockFindUniqueUser.mockResolvedValueOnce(null);
    await expect(depositToWallet(999, 100, "test", "key"))
      .rejects.toThrow('User does not exist in the system.');
  });
  test('Should throw error if user has no wallet associated (Deposit)', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({
      id: 999,
      wallet: null
    });
    await expect(depositToWallet(999, 100, "deposit", "key-999"))
      .rejects.toThrow("User found, but no wallet is associated with this account.");
  });

  test('Should throw if user does not exist for withdraw', async () => {
    mockFindUniqueUser.mockResolvedValueOnce(null);
    await expect(withdrawFromWallet(999, 100, "test", "key"))
      .rejects.toThrow('User does not exist in the system.');
  });
  test('Should throw error if user has no wallet associated (Withdraw)', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({
      id: 999,
      wallet: null
    });
    await expect(withdrawFromWallet(999, 100, "deposit", "key-999"))
      .rejects.toThrow("User found, but no wallet is associated with this account.");
  });


  test('Should throw if transfer IDs are invalid', async () => {
    await expect(transferFunds("abc", "xyz", 100, "test", "key"))
      .rejects.toThrow('Invalid User IDs');
  });



test('Should throw error if receiver wallet does not exist', async () => {
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockFindUniqueWallet
      .mockResolvedValueOnce({ userId: 1, realBalance: 500 })
      .mockResolvedValueOnce(null);

    await expect(transferFunds(1, 2, 100, "Gift", "key-recv"))
      .rejects.toThrow('Receiver wallet not found');

    expect(mockUpdateWallet).not.toHaveBeenCalled();
  });

  test('Should throw error if sender wallet does not exist', async () => {
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockFindUniqueWallet.mockResolvedValueOnce(null);

    await expect(transferFunds(1, 2, 100, "Gift", "key-send"))
      .rejects.toThrow('Sender wallet not found');
  });

  test('Should process deposit normally when idempotency key is null', async () => {
    mockFindUniqueUser.mockResolvedValueOnce({ id: 1, wallet: { userId: 1 } });
    mockFindUniqueTx.mockResolvedValueOnce(null);
    mockUpdateWallet.mockResolvedValueOnce({ userId: 1, realBalance: 150 });
    mockCreateTx.mockResolvedValueOnce({});

    const result = await depositToWallet(1, 50, "Top-up", null);

    expect(result.success).toBe(true);
    expect(result.alreadyProcessed).toBeUndefined();
    expect(mockFindUniqueTx).not.toHaveBeenCalled();
    expect(mockUpdateWallet).toHaveBeenCalledTimes(1);
  });

  test('Should return null if wallet does not exist for getWalletByUserId', async () => {
    mockFindUniqueWallet.mockResolvedValueOnce(null);

    const result = await getWalletByUserId(999);

    expect(result).toBeNull();
    expect(mockFindUniqueWallet).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 999 } })
    );
  });

  test('Should return empty array if user has no transaction history', async () => {
    mockFindTransactions.mockResolvedValueOnce([]);

    const result = await getTransactionHistory("5");

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
    expect(mockFindTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ where: { walletId: 5 } })
    );
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