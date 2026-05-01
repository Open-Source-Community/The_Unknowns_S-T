import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  
const navLinks = [
    { name: 'Marketplace', path: '/marketplace' }, 
    { name: 'Features', path: '/#features' },
    { name: 'Who Are We', path: '/#about' },                
  ];

  return (
    <nav className="flex justify-between items-center py-2 px-20 border-b border-slate-800/50 relative z-50 backdrop-blur-md">
      
      {/* Logo Section */}
      <Link to="/" className="flex flex-col m-2 group">
        <span className="text-[10px] text-cyan-500 font-black tracking-[0.4em] uppercase animate-pulse">
          Architect X
        </span>
        <span className="text-xl font-black tracking-tighter text-white">
          FOUNDRY<span className="text-purple-600 group-hover:text-cyan-400 transition-colors">.</span>
        </span>
      </Link>
      
      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-10 text-[12px] font-bold text-slate-400 uppercase tracking-[0.15em]">
        {navLinks.map((link) => (
          link.path.includes('#') ? (
            <a 
              key={link.name} 
              href={link.path} 
              className="hover:text-cyan-400 transition-all duration-300 relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full"></span>
            </a>
          ) : (
            <Link 
              key={link.name} 
              to={link.path} 
              className="hover:text-cyan-400 transition-all duration-300 relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full"></span>
            </Link>
          )
        ))}
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-6">
        <Link 
          to="/login" 
          className="text-sm font-bold text-slate-300 hover:text-cyan-400 transition-colors"
        >
          Login
        </Link>
        
        <Link to="/register">
          <button className="px-6 py-2.5 rounded-full border border-cyan-500/40 text-cyan-400 text-xs font-black hover:bg-gradient-to-r hover:from-cyan-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-500 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-cyan-500/40 transform hover:-translate-y-0.5">
            JOIN FOUNDRY
          </button>
        </Link>
      </div>
    </nav>
  );
};