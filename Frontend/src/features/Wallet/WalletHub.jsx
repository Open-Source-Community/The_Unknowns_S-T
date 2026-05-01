import React, { useEffect, useState } from 'react';
import API from '../../api/axiosConfig';
import { ENDPOINTS } from '../../constants/apiEndpoints';
import { 
  ArrowUpRight, ArrowDownLeft, Send, 
  History, Wallet as WalletIcon, TrendingUp, 
  RefreshCcw, Search, ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const WalletHub = () => {
  const { user, updateBalance } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Credit Matrix :: Architect X";
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get(ENDPOINTS.WALLET_HISTORY);
      if (res.data.success) setHistory(res.data.data);
    } catch (err) {
      console.error("Ledger Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    updateBalance(); // Sync real balance from server on mount
  }, []);

  
  const executeTransaction = async (type) => {
    const isTransfer = type === 'transfer';
    
    const { value: formValues } = await Swal.fire({
      title: type.toUpperCase(),
      html: `
        ${isTransfer ? '<input id="swal-receiver" class="swal2-input" placeholder="Receiver ID">' : ''}
        <input id="swal-amount" type="number" class="swal2-input" placeholder="Amount ($)">
        <input id="swal-desc" class="swal2-input" placeholder="Description (Optional)">
      `,
      focusConfirm: false,
      background: '#020617',
      color: '#fff',
      confirmButtonText: 'EXECUTE',
      showCancelButton: true,
      customClass: { popup: 'rounded-[2.5rem] border border-slate-800' },
      preConfirm: () => {
        return {
          receiverId: isTransfer ? document.getElementById('swal-receiver').value : null,
          amount: document.getElementById('swal-amount').value,
          description: document.getElementById('swal-desc').value
        }
      }
    });

    if (formValues?.amount) {
      try {
        const payload = isTransfer 
          ? { senderId: user.id, receiverId: parseInt(formValues.receiverId), amount: parseFloat(formValues.amount), description: formValues.description }
          : { userId: user.id, amount: parseFloat(formValues.amount), description: formValues.description };

        const endpoint = type === 'deposit' ? ENDPOINTS.WALLET_TOPUP : 
                         type === 'withdraw' ? ENDPOINTS.WALLET_WITHDRAW : 
                         ENDPOINTS.WALLET_TRANSFER;

        const res = await API.post(endpoint, payload, {
          headers: { 'Idempotency-Key': `${type}-${Date.now()}` }
        });

        if (res.data.success) {
          Swal.fire('SUCCESS', res.data.message, 'success');
          updateBalance();
          fetchHistory();
        }
      } catch (err) {
        Swal.fire('FAILED', err.response?.data?.message || 'Transaction Interrupted', 'error');
      }
    }
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      
      {/* 1. Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] ml-1">Financial_Grid_Status</span>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Vault <span className="text-cyan-400">Ledger.</span></h2>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3">
          <ActionButton onClick={() => executeTransaction('deposit')} icon={<ArrowDownLeft size={16}/>} label="Deposit" color="text-green-400" />
          <ActionButton onClick={() => executeTransaction('withdraw')} icon={<ArrowUpRight size={16}/>} label="Withdraw" color="text-red-400" />
          <ActionButton onClick={() => executeTransaction('transfer')} icon={<Send size={16}/>} label="Transfer" color="text-purple-400" />
       </div>
      </div>

<div className="flex flex-col lg:flex-row gap-6 items-stretch">
  
  
  <div className="lg:w-1/3 xl:w-1/4 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-center min-w-[280px]">
  
  
    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
      <WalletIcon size={80} className="text-cyan-500" />
    </div>
    
    <div className="relative z-10">
      <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
        <TrendingUp size={14} className="text-cyan-400" /> Current Liquidity
      </h4>
      
      <div className="flex items-baseline gap-2">
        <span className="text-slate-600 text-2xl font-black">$</span>
        <span className="text-5xl md:text-6xl font-black text-white tracking-tighter italic">
          {parseFloat(user?.wallet?.realBalance || 0).toLocaleString()}
        </span>
      </div>
      
      <p className="mt-8 text-[8px] font-black text-slate-700 uppercase tracking-[0.4em]">
        Authorized Node Access Only
      </p>
    </div>
  </div>

  {/* 3. Transaction Logs*/}
  <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl overflow-hidden min-h-[400px]">
  
     <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-6 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
          <History size={16} className="text-purple-500" /> Transaction_Logs
        </h3>
        <button onClick={fetchHistory} className="text-slate-500 hover:text-purple-500 transition-colors">
          <RefreshCcw size={14} />
        </button>
     </div>
     
     <div className="overflow-x-auto">
        <table className="w-full text-left">
             
              <thead className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-950/50">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-medium text-slate-400 divide-y divide-slate-800/50">
                {history.length > 0 ? history.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4 font-mono text-[10px] text-slate-500">{tx.referenceId}</td>
                    <td className="p-4 uppercase tracking-wider font-bold text-slate-300">{tx.category}</td>
                    <td className={`p-4 font-black ${tx.type === 'Credit' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'Credit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                    </td>
                    <td className="p-4 text-right text-[10px] text-slate-600 font-mono">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center py-20 opacity-40">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">No Transactions Detected</p>
                      <p className="text-[8px] font-mono uppercase">Ledger is currently dormant</p>
                    </td>
                  </tr>
                )}
              </tbody>
      
        </table>
     </div>
  </div>

</div>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, color }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all group`}>
    <span className={`${color} group-hover:scale-110 transition-transform`}>{icon}</span>
    <span className="text-[10px] font-black text-white uppercase tracking-widest">{label}</span>
  </button>
);

export default WalletHub;