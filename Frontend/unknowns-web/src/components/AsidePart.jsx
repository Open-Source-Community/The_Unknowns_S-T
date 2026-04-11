import React from 'react';
import { NavLink } from 'react-router-dom'; 
import { 
  Zap, ShoppingBag, Wallet, LayoutDashboard, 
  PlusCircle, User as UserIcon, LogOut 
} from 'lucide-react';
import { ROLES } from '../constants/apiEndpoints'; 

export const AsidePart = ({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  user, 
  setIsModalOpen, 
  logout 
}) => {
  
  
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <aside className={`
      fixed top-0 left-0 z-[70] h-screen bg-slate-950 border-r border-slate-900 
      transition-all duration-500 ease-in-out flex flex-col shadow-2xl overflow-hidden
      ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full'}
    `}>
      {/* Logo Section */}
      <div className="p-6 mb-6 flex items-center gap-3 overflow-hidden shrink-0 border-b border-slate-900/50">
        <div className="min-w-[40px] h-10 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Zap size={22} className="text-white fill-current" />
        </div>
        <span className={`text-xl font-black tracking-tighter text-white italic whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
          UNKNOWN<span className="text-fuchsia-500">$</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pt-4">
        {user?.role === ROLES.BUYER && (
          <>
            <NavItem icon={<ShoppingBag size={22}/>} label="Marketplace" to="/marketplace" onClick={closeSidebar} />
            <NavItem icon={<Wallet size={22}/>} label="My Orders" to="/orders" onClick={closeSidebar} />
          </>
        )}

        {user?.role === ROLES.SELLER && (
          <>
            <NavItem icon={<LayoutDashboard size={22}/>} label="Overview" to="/dashboard" onClick={closeSidebar} />
          
            <button 
              onClick={() => { setIsModalOpen(true); closeSidebar(); }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group text-slate-500 hover:text-cyan-400 hover:bg-slate-900"
            >
              <PlusCircle size={22} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mint Asset</span>
            </button>
            <NavItem icon={<ShoppingBag size={22}/>} label="Inventory" to="/inventory" onClick={closeSidebar} />
            <NavItem icon={<Zap size={22}/>} label="Public Market" to="/marketplace" onClick={closeSidebar} />
          </>
        )}
        
        <div className="pt-4 mt-4 border-t border-slate-900">
           <NavItem icon={<UserIcon size={22}/>} label="Profile" to="/profile" onClick={closeSidebar} />
        <NavItem 
  icon={<Wallet size={22}/>} 
  label="Vault Wallet" 
  to="/wallet" 
  onClick={closeSidebar} 
/>
        </div>
      </nav>

      {/* Terminate Button */}
      <div className="p-4 border-t border-slate-900 shrink-0">
        <button onClick={logout} className="flex items-center gap-4 text-slate-500 hover:text-red-400 w-full p-4 rounded-2xl transition-all group overflow-hidden hover:bg-red-500/5">
          <LogOut size={22} className="min-w-[22px]" />
          <span className={`font-bold text-[10px] uppercase tracking-widest whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            Terminate
          </span>
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, to, onClick }) => (
  <NavLink 
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative
      ${isActive 
        ? 'bg-gradient-to-r from-purple-600/20 to-transparent text-purple-400 border-l-2 border-purple-500 font-black shadow-lg shadow-purple-500/5' 
        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'}
    `}
  >
    <div className="transition-colors min-w-[22px]">
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
      {label}
    </span>
  </NavLink>
);