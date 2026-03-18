import { depositToWallet, withdrawFromWallet, transferFunds , getTransactionHistory,getWalletByUserId} from "../services/walletService.js";

export const deposit=async(req,res)=>{
  const { userId, amount, description } = req.body;
const idempotencyKey = req.headers['idempotency-key'];
try {
      if (amount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid amount. The deposited amount must be greater than zero." });
    }

    const wallet=await depositToWallet(userId,amount,description,idempotencyKey);
res.json({
    success:true,
    message:"Deposit Successful!",
    balance:wallet.realBalance
});
} catch (error) {

    res.status(500).json({
        error:error.message
    });
}

};


export const withdraw=async(req,res)=>{
    const {userId,amount,description}=req.body;
    const idempotencyKey = req.headers['idempotency-key'];
try{
      if (amount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid amount. The withdrawn amount must be greater than zero." });
    }

const wallet=await withdrawFromWallet(userId,amount,description,idempotencyKey);
res.json({
    success:true,
    message:"Withdrawal successful!",
    newBalance:wallet.realBalance
});
}catch(error){
res.status(400).json({success:false, error:error.message});
}
};

export const transfer = async (req, res) => {
  const { senderId, receiverId, amount, description } = req.body;
  const idempotencyKey = req.headers['idempotency-key']; 
  try {
    if (senderId === receiverId) {
      return res.status(400).json({ success: false, error: "Cannot transfer to yourself" });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid amount. The transferred amount must be greater than zero." });
    }

    const result = await transferFunds(senderId, receiverId, amount, description,idempotencyKey);
    
    res.status(200).json({
      success: true,
      message: "Transfer successful!",
      data: result
    });
  } catch (error) {
    console.error("Transfer Error:", error.message);
    res.status(400).json({ success: false, error: error.message });
    
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
    res.status(500).json({ success: false, error: error.message });
  }
};



export const getBalance = async (req, res) => {
  const { userId } = req.params;
  try {
    const wallet = await getWalletByUserId(userId);
    
    if(!wallet) {
      return res.status(404).json({ success: false, error: "Wallet not found" });
    }

    res.status(200).json({
      success: true,
      balance: wallet.realBalance,
      promoBalance: wallet.promoBalance,
      recentTransactions: wallet.transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

