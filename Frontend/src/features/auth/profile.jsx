import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Shield, Wallet as WalletIcon, 
  Clock, Activity, Terminal, ShieldCheck 
} from 'lucide-react';
import { ExternalLink } from 'lucide-react';
const Profile = () => {
  const { user } = useAuth();
  const { updateBalance } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    updateBalance(); // Sync real balance from server on mount
  }, []);


  const joinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Foundational_Era';

const handleTopUp = async () => {
  const { value: amount } = await Swal.fire({
    title: 'INITIALIZE DEPOSIT',
    input: 'number',
    inputLabel: 'Enter amount in Credits ($)',
    inputPlaceholder: 'e.g. 100',
    background: '#020617',
    color: '#f8fafc',
    confirmButtonColor: '#a855f7',
    showCancelButton: true,
    inputAttributes: {
      min: 1,
      step: 1
    },
    customClass: {
      popup: 'rounded-[2.5rem] border border-slate-800 backdrop-blur-3xl',
      input: 'bg-slate-950 border-slate-800 text-cyan-400 font-mono text-center rounded-xl'
    }
  });

  if (amount) {
    try {
      
      const response = await API.post(ENDPOINTS.WALLET_TOPUP, { amount: parseFloat(amount) });
      
      if (response.data.success) {
      await updateBalance();
      
      Swal.fire({
        title: 'CREDITS MINTED',
        text: 'Wallet balance updated successfully.',
        icon: 'success',
        background: '#020617',
        color: '#f8fafc'
      });
    
      }
    } catch (err) {
      Swal.fire({
        title: 'TRANSFER FAILED',
        text: err.response?.data?.message || 'Check your neural link (Connection Error)',
        icon: 'error',
        background: '#020617',
        color: '#f8fafc'
      });
    }
  }
};


  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="mb-12">
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] ml-1">
          Identity_Management
        </span>
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
          Architect <span className="text-cyan-500">Profile.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/5 blur-[80px] rounded-full -z-10" />
            
            <div className="flex items-center gap-8 mb-12">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 rounded-3xl flex items-center justify-center shadow-2xl">
                <User size={40} className="text-slate-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">
                  {user?.name || user?.email?.split('@')[0]} <span className="text-slate-600 text-sm">#NODE-{user?.id}</span>
                </h3>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status: Active_Authorized</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ProfileInfoItem icon={<User size={18}/>} label="Full Identity" value={user?.name || 'Legacy_Node'} highlight />
              <ProfileInfoItem icon={<Mail size={18}/>} label="Email Protocol" value={user?.email} />
              <ProfileInfoItem icon={<Shield size={18}/>} label="Authorization Role" value={user?.role} />
              <ProfileInfoItem icon={<Clock size={18}/>} label="Deployment Date" value={joinDate} />
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-slate-900/20 border border-slate-800/50 rounded-[2rem] p-8 flex items-center justify-between">
             <div className="flex items-center gap-4 text-slate-500">
                <Activity size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Recent Node Activity: 0 Breaches Detected</span>
             </div>
             <ShieldCheck size={20} className="text-fuchsia-500/50" />
          </div>
        </div>

    {/* Right Column: Wallet Summary */}
    <div className="space-y-8">
      <div 
        onClick={() => navigate('/wallet')}
        
        className="bg-gradient-to-br from-cyan-600/20 to-blue-600/5 border border-cyan-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl cursor-pointer group hover:border-cyan-500/50 transition-all"
      >
        <div className="flex justify-between items-start mb-6">
           <WalletIcon className="text-cyan-500 group-hover:scale-110 transition-transform" size={32} />
           <ExternalLink size={16} className="text-slate-600 group-hover:text-cyan-400" />
        </div>
        
        <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-2">Foundry Balance</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-white tracking-tighter">
            ${parseFloat(user?.wallet?.realBalance || 0).toFixed(2)}
          </span>
        </div>
        <p className="mt-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Click to view transaction ledger</p>
      </div>
      
    </div>


      </div>
    </div>
  );
};


const ProfileInfoItem = ({ icon, label, value, highlight }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-slate-600">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className={`text-sm font-bold tracking-tight ${highlight ? 'text-cyan-400' : 'text-slate-300'}`}>
      {value || 'Not_Set'}
    </div>
  </div>
);

export default Profile;