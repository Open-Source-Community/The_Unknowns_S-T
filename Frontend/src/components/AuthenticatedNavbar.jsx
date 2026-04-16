import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, User, ChevronDown, LogOut, Zap } from 'lucide-react';

export const AuthenticatedNavbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <nav className="h-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 px-6 flex justify-between items-center sticky top-0 z-[60]">

      {/* 1. Menu*/}
      <div className="flex items-center gap-4 ">
        <button
          onClick={onMenuClick}
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all active:scale-95"
          title="Open Control Panel"
        >
          <Menu size={22} />
        </button>
        <div className="hidden lg:block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          Terminal // <span className="text-cyan-500">Active</span>
        </div>
      </div>

      {/* 2. Logo*/}
      <Link to="/dashboard" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-cyan-500 fill-current group-hover:animate-pulse" />
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">
            Architect<span className="text-purple-500">X</span>
          </span>
        </div>
      </Link>

      {/* 3. Profile*/}
      <div className="flex items-center gap-3">
        {/* Profile drop down*/}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 bg-slate-900 border border-slate-800 rounded-full hover:border-cyan-500/50 transition-all shadow-lg"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-cyan-600 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-xs shadow-inner">
              {(user?.name || user?.email)?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-xs font-bold text-slate-300 pr-1">
              {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}
            </span>
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 animate-in slide-in-from-top-2 duration-200">
              <Link
                to="/profile"
                onClick={() => setIsProfileOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800 rounded-xl transition-all"
              >
                <User size={16} className="text-purple-400" />
                Go to Profile
              </Link>
              <div className="h-[1px] bg-slate-800 my-1 mx-2"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
              >
                <LogOut size={16} />
                Terminate Session
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};