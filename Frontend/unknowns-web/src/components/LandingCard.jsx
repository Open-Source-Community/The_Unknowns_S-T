import React from 'react';

export const LandingCard = ({ icon, title, desc }) => (
  <div className="group relative p-8 rounded-[2rem] border border-slate-800 bg-slate-900/40 backdrop-blur-xl hover:border-fuchsia-500/50 transition-all duration-500 overflow-hidden">
    
    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-[2rem] blur opacity-0 group-hover:opacity-15 transition duration-500" />
    
    <div className="relative">
        
      <div className="mb-6 p-4 bg-purple-500/10 rounded-2xl w-fit text-purple-400 group-hover:text-fuchsia-400 group-hover:scale-110 transition-all duration-500">
        {icon}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-fuchsia-100 transition-colors">
        {title}
      </h3>
      
      <p className="text-slate-400 text-sm leading-relaxed font-medium group-hover:text-slate-300 transition-colors">
        {desc}
      </p>
    </div>
  </div>
);