import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  
const navLinks = [
    { name: 'Marketplace', path: '/marketplace' }, 
    { name: 'About', path: '#about' },            
    { name: 'Resources', path: '#resources' },    
    { name: 'FAQ', path: '#faq' },                
  ];

  return (
    <nav className="flex justify-between items-center py-2 px-20 border-b border-slate-800/50 relative z-50 backdrop-blur-md">
      
      {/* Logo Section */}
      <Link to="/" className="flex flex-col m-2 group">
        <span className="text-[10px] text-fuchsia-500 font-black tracking-[0.4em] uppercase animate-pulse">
          The Unknowns
        </span>
        <span className="text-xl font-black tracking-tighter text-white">
          ARTIFACTS<span className="text-purple-500 group-hover:text-cyan-400 transition-colors">.</span>
        </span>
      </Link>
      
      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-10 text-[12px] font-bold text-slate-400 uppercase tracking-[0.15em]">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            className="hover:text-fuchsia-400 transition-all duration-300 relative group"
          >
            {link.name}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-fuchsia-500 transition-all group-hover:w-full"></span>
          </Link>
        ))}
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-6">
        <Link 
          to="/login" 
          className="text-sm font-bold text-slate-300 hover:text-purple-400 transition-colors"
        >
          Login
        </Link>
        
        <Link to="/register">
          <button className="px-6 py-2.5 rounded-full border border-purple-500/40 text-purple-400 text-xs font-black hover:bg-gradient-to-r hover:from-purple-600 hover:to-fuchsia-600 hover:text-white hover:border-transparent transition-all duration-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-purple-500/40 transform hover:-translate-y-0.5">
            JOIN VAULT
          </button>
        </Link>
      </div>
    </nav>
  );
};