import { depositToWallet, withdrawFromWallet, transferFunds, getTransactionHistory, getWalletByUserId } from "../services/walletService.js";

const getStatusCode = (message) => {
  if (message.includes("not found") ||
    message.includes("does not exist") ||
    message.includes("no wallet")) return 404;
  if (message.includes("Insufficient") ||
    message.includes("Invalid")) return 400;
  return 500;
};

export const deposit = async (req, res) => {
  const { userId, amount, description } = req.body;
  const idempotencyKey = req.headers['idempotency-key'];

  try {
    const uId = parseInt(userId);
    if (!uId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid input: userId and a positive amount are required."
      });
    }

    const result = await depositToWallet(uId, amount, description, idempotencyKey);

    if (!result) {
      return res.status(404).json({ success: false, error: "Wallet not found" });
    }

    return res.status(200).json({
      success: true,
      message: result.alreadyProcessed ? "Duplicate request ignored" : "Deposit Successful!",
      balance: result.wallet.realBalance,
      alreadyProcessed: result.alreadyProcessed || false
    });

  } catch (error) {
    return res.status(getStatusCode(error.message))
      .json({ success: false, error: error.message });
  }
};

export const withdraw = async (req, res) => {
  const { userId, amount, description } = req.body;
  const idempotencyKey = req.headers['idempotency-key'];
  try {
    const uId = parseInt(userId);
    if (!uId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid input: userId and a positive amount are required."
      });
    }


    const result = await withdrawFromWallet(uId, amount, description, idempotencyKey);

    if (!result) {
      return res.status(404).json({ success: false, error: "Wallet not found" });
    }

    res.status(200).json({
      success: true,
      message: result.alreadyProcessed ? "Duplicate request ignored" : "Withdrawal successful!",
      balance: result.wallet.realBalance,
      alreadyProcessed: result.alreadyProcessed || false
    });
  } catch (error) {
    return res.status(getStatusCode(error.message))
      .json({ success: false, error: error.message });
  }
};

export const transfer = async (req, res) => {
  const { senderId, receiverId, amount, description } = req.body;
  const idempotencyKey = req.headers['idempotency-key'];

  try {
    const sId = parseInt(senderId);
    const rId = parseInt(receiverId);

    if (sId === rId) {
      return res.status(400).json({ success: false, error: "Cannot transfer to yourself" });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid amount. The transferred amount must be greater than zero." });
    }

    const result = await transferFunds(sId, rId, amount, description, idempotencyKey);

    return res.status(200).json({
      success: true,
      message: result.alreadyProcessed ? "Duplicate request ignored" : "Transfer Successful!",
      balance: result.wallet.realBalance,
      alreadyProcessed: result.alreadyProcessed || false
    });
  } catch (error) {
    return res.status(getStatusCode(error.message))
      .json({ success: false, error: error.message });
  }
};


export const getHistory = async (req, res) => {
  const { userId } = req.params;
  try {
    const history = await getTransactionHistory(userId);
    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    return res.status(getStatusCode(error.message))
      .json({ success: false, error: error.message });
  }
};



export const getBalance = async (req, res) => {
  const { userId } = req.params;
  try {
    const wallet = await getWalletByUserId(userId);

    if (!wallet) {
      return res.status(404).json({ success: false, error: "Wallet not found" });
    }

    res.status(200).json({
      success: true,
      balance: wallet.realBalance,
      promoBalance: wallet.promoBalance,
      recentTransactions: wallet.transactions
    });
  } catch (error) {
    return res.status(getStatusCode(error.message))
      .json({ success: false, error: error.message });
  }
};

