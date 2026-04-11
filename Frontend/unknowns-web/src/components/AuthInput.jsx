import React from 'react';

export const AuthInput = ({ label, icon: Icon, ...props }) => (
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
        className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl 
                   focus:ring-2 focus:ring-cyan-500/30 focus:border-purple-500/50 
                   focus:bg-slate-950 outline-none transition-all duration-300 
                   text-white placeholder:text-slate-600 font-medium"
      />


      <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-0 h-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 group-focus-within:w-3/4 transition-all duration-700 opacity-70" />
    </div>
  </div>
);