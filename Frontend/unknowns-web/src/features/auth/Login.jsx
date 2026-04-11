import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Loader2, ShieldAlert } from 'lucide-react';
import { AuthInput } from '../../components/AuthInput';
import { Button } from '../../components/Button';
import API from '../../api/axiosConfig';
import { ENDPOINTS } from '../../constants/apiEndpoints';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // await login({ email, password });
const response = await API.post(ENDPOINTS.LOGIN, { email, password });
if (response.data.success) {
  login(response.data.data);
  navigate('/dashboard');
}

      // navigate('/dashboard');
    } catch (err) {
      console.log("FULL ERROR OBJECT:", err);
  console.log("STATUS:", err.response?.status);
      const msg = err.response?.data?.message || 'Invalid Decryption Key';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden font-sans">
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-purple-900/15 blur-[120px] rounded-full" />
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-fuchsia-900/10 blur-[100px] rounded-full" />

      <div className="bg-slate-900/40 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-800/50 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase">Access Vault</h2>
          <p className="text-slate-400 font-medium text-sm">Decrypt your session to browse artifacts</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-2xl flex items-center gap-3">
            <ShieldAlert size={16} />
            <span className="uppercase tracking-wider">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <AuthInput label="Email" icon={Mail} type="email" placeholder="engineer@unknowns.com" required
            onChange={(e) => setEmail(e.target.value)} />
          <AuthInput label="Password" icon={Lock} type="password" placeholder="••••••••" required
            onChange={(e) => setPassword(e.target.value)} />

          <Button type="submit" disabled={isLoading} className="w-full py-4 text-base bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-purple-500/20">
            {isLoading ? <Loader2 className="animate-spin" /> : 'DECRYPT & ENTER'}
          </Button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm font-bold uppercase tracking-tighter">
          New Architect? <Link to="/register" className="text-cyan-400 hover:text-fuchsia-400 transition ml-1">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;