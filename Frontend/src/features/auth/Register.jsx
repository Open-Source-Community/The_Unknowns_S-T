import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/apiEndpoints';
import { Mail, Lock, User, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { AuthInput } from '../../components/AuthInput';
import { Button } from '../../components/Button';
import Swal from 'sweetalert2';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'Buyer' 
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      
      const payload = {
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      await register(payload);

      await Swal.fire({
        title: 'PROTOCOL INITIALIZED',
        text: 'Your architect identity has been secured.',
        icon: 'success',
        background: '#020617',
        color: '#f8fafc',
        confirmButtonColor: '#a855f7',
        iconColor: '#f5d0fe',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-800 backdrop-blur-3xl shadow-fuchsia-500/10',
        }
      });

      navigate('/login');
    } catch (err) {
   
      
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden font-sans">
      {/* Decorative Background Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-purple-600/5 blur-[100px] rounded-full" />
      
      <div className="bg-slate-900/40 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-800/50 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase italic">Join The <span className="text-fuchsia-500 italic">Vault</span></h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Initialize your architect credentials</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle size={14} />
            <span className="uppercase tracking-widest">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput 
            label="Identity Name" icon={User} type="text" placeholder="Unknowns Team" required
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
          <AuthInput 
            label="Email Address" icon={Mail} type="email" placeholder="ARCHITECT@VAULT.COM" required
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          <AuthInput 
            label="Secure Key" icon={Lock} type="password" placeholder="••••••••" required
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />

          <div className="space-y-2">
            <label className="block text-[9px] font-black text-slate-600 mb-1 ml-1 uppercase tracking-[0.3em]">Sector Role</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <Briefcase size={16}/>
              </span>
              <select 
                className="w-full pl-11 pr-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none appearance-none cursor-pointer focus:border-fuchsia-500/50 transition-all uppercase tracking-widest"
                onChange={(e) => setFormData({...formData, role: e.target.value})} 
                value={formData.role}
              >
                <option value="Buyer">Buyer (Acquire Assets)</option>
                <option value="Seller">Seller (Mint Assets)</option>
              </select>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full py-5 mt-4 text-[11px] font-black tracking-[0.2em] bg-white text-black hover:bg-fuchsia-500 hover:text-white transition-all duration-500 rounded-2xl"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'INITIALIZE PROTOCOL'}
          </Button>
        </form>

        <p className="mt-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
          Already verified? <Link to="/login" className="text-fuchsia-500 hover:text-white transition ml-1 underline decoration-fuchsia-500/30">Access Vault</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;