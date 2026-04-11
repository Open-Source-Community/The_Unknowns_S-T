import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center justify-center group text-sm tracking-wide";

  const variants = {
    
    dark: "bg-slate-950 text-white border border-slate-800 hover:bg-slate-900 hover:border-purple-500/50 shadow-xl shadow-black/50",
    
    
    secondary: "border border-slate-700 text-slate-300 hover:text-fuchsia-400 hover:border-fuchsia-500/50 backdrop-blur-md",
    
    
    primary: "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-500 hover:to-fuchsia-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};