import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Loader2, AlertCircle, ShoppingBag, Package, CheckCircle2, XCircle } from 'lucide-react';
import { AuthInput } from '../../components/AuthInput';
import { Button } from '../../components/Button';
import Swal from 'sweetalert2';

// Password rules definition
const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number (0–9)', test: (p) => /[0-9]/.test(p) },
];

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
  const [showPasswordHints, setShowPasswordHints] = useState(false);

  useEffect(() => {
    document.title = "Initialize Protocol :: Architect X";
  }, []);

  const passwordChecks = PASSWORD_RULES.map(rule => ({
    ...rule,
    passed: rule.test(formData.password),
  }));
  const passedCount = passwordChecks.filter(r => r.passed).length;
  const strengthPercent = (passedCount / PASSWORD_RULES.length) * 100;
  const strengthColor =
    passedCount <= 1 ? 'bg-red-500' :
      passedCount === 2 ? 'bg-orange-400' :
        passedCount === 3 ? 'bg-yellow-400' : 'bg-cyan-400';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      return setError('Your Secure Key must be at least 8 characters long. Check the requirements below.');
    }

    setError('');
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
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
        confirmButtonColor: '#06b6d4',
        iconColor: '#22d3ee',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-[2.5rem] border border-slate-800 backdrop-blur-3xl shadow-cyan-500/10',
        }
      });

      navigate('/login');
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden font-sans">
      {/* Decorative Background Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-purple-600/10 blur-[100px] rounded-full" />

      <div className="bg-slate-900/40 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-800/50 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase italic">
            Join The <span className="text-cyan-500 italic">Foundry</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
            Initialize your architect credentials
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 animate-pulse" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            label="Identity Name" icon={User} type="text" placeholder="Architect Name" required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <AuthInput
            label="Email Address" icon={Mail} type="email" placeholder="ARCHITECT@VAULT.COM" required
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          {/* Password field with strength meter */}
          <div className="space-y-2">
            <AuthInput
              label="Secure Key" icon={Lock} type="password" placeholder="••••••••" required
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onFocus={() => setShowPasswordHints(true)}
            />

            {/* Strength bar */}
            {formData.password.length > 0 && (
              <div className="mt-2 space-y-2 animate-in slide-in-from-top-1 duration-200">
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${strengthColor}`}
                    style={{ width: `${strengthPercent}%` }}
                  />
                </div>

                {/* Per-rule checklist */}
                {showPasswordHints && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {passwordChecks.map(rule => (
                      <div key={rule.id} className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider transition-colors ${rule.passed ? 'text-cyan-400' : 'text-slate-600'}`}>
                        {rule.passed
                          ? <CheckCircle2 size={10} className="shrink-0" />
                          : <XCircle size={10} className="shrink-0" />}
                        {rule.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Role Selector — Card Style */}
          <div className="space-y-2">
            <label className="block text-[9px] font-black text-slate-600 ml-1 uppercase tracking-[0.3em]">
              Sector Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Buyer Card */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'Buyer' })}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 group ${formData.role === 'Buyer'
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.1)]'
                  : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                  }`}
              >
                {formData.role === 'Buyer' && (
                  <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
                <ShoppingBag size={22} className="transition-transform group-hover:scale-110" />
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest">Buyer</p>
                  <p className="text-[8px] font-medium text-slate-600 mt-0.5 leading-tight">Acquire artifacts</p>
                </div>
              </button>

              {/* Seller Card */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'Seller' })}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 group ${formData.role === 'Seller'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.1)]'
                  : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                  }`}
              >
                {formData.role === 'Seller' && (
                  <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                )}
                <Package size={22} className="transition-transform group-hover:scale-110" />
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest">Seller</p>
                  <p className="text-[8px] font-medium text-slate-600 mt-0.5 leading-tight">Mint & deploy blueprints</p>
                </div>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 mt-4 text-[11px] font-black tracking-[0.2em] bg-white text-black hover:bg-cyan-500 hover:text-white transition-all duration-500 rounded-2xl"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'INITIALIZE PROTOCOL'}
          </Button>
        </form>

        <p className="mt-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
          Already verified?{' '}
          <Link to="/login" className="text-cyan-500 hover:text-white transition ml-1 underline decoration-cyan-500/30">
            Access Foundry
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;