import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center justify-center group text-sm tracking-wide";

  const variants = {
    
    dark: "bg-slate-950 text-white border border-slate-800 hover:bg-slate-900 hover:border-purple-500/50 shadow-xl shadow-black/50",
    
    
    secondary: "border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 backdrop-blur-md",
    
    
    primary: "bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};