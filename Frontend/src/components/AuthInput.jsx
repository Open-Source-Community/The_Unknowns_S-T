import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const AuthInput = ({ label, icon: Icon, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="w-full">
      <label className="block text-[10px] font-black text-slate-500 mb-2 ml-1 uppercase tracking-[0.2em]">
        {label}
      </label>
      
      <div className="relative group">
        
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300">
          <Icon size={18} />
        </span>

        <input 
          {...props}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className="w-full pl-11 pr-12 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl 
                     focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 
                     focus:bg-slate-950 outline-none transition-all duration-300 
                     text-white placeholder:text-slate-600 font-medium"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-cyan-400 transition-colors duration-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-0 h-[1px] bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-400 group-focus-within:w-3/4 transition-all duration-700 opacity-70" />
      </div>
    </div>
  );
};