import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/apiEndpoints';
import Marketplace from '../marketplace/Marketplace.jsx';
import SellerInventory from '../sellerInventory/SellerInventory.jsx';
import AddProductModal from '../../features/products/AddProductModal'; 
// import { AuthenticatedNavbar } from '../../components/AuthenticatedNavbar';
import {AsidePart} from '../../components/AsidePart.jsx';
import { 
  LayoutDashboard, ShoppingBag, Wallet, 
  PlusCircle, LogOut, ShieldAlert, 
  Settings, Zap, Activity, User as UserIcon
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  useEffect(() => {
    if (!user?.role) return;
    if (user.role === ROLES.BUYER) setActiveTab('market');
    else if (user.role === ROLES.SELLER) setActiveTab('inventory');
    else if (user.role === ROLES.ADMIN) setActiveTab('admin-panel');
  }, [user]);

  const handleProductAdded = () => setRefreshTrigger(prev => prev + 1);

  return (
    <div className="flex min-h-screen bg-[#020617] font-sans text-slate-200 overflow-hidden">
      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onProductAdded={handleProductAdded}
      />



{/* --- SIDEBAR OVERLAY ---

{isSidebarOpen && (
  <div 
    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[65] lg:z-[65]" 
    onClick={() => setIsSidebarOpen(false)} 
  />
)}
<AsidePart 
  isSidebarOpen={isSidebarOpen} 
  setIsSidebarOpen={setIsSidebarOpen}
  user={user} 
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  setIsModalOpen={setIsModalOpen}
  logout={logout}
/>   */}


      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        
        {/* <AuthenticatedNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} /> */}

        {/* --- VIEWPORT --- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full -z-10" />

          {/* Tab Switcher */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'market' && <Marketplace />}
            {activeTab === 'inventory' && <SellerInventory key={refreshTrigger} />}
            {activeTab === 'orders' && <MyOrders />}
            
            {activeTab === 'overview' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Vault Credits" value={`$${user?.wallet?.realBalance || 0}`} icon={<Activity className="text-cyan-400" />} />
                  <StatCard label="Success Rate" value="99.9%" icon={<ShieldAlert className="text-fuchsia-400" />} />
                  <StatCard label="Artifacts" value={products?.length || '0'} icon={<ShoppingBag className="text-purple-400" />} />
               </div>
            )}

            {activeTab === 'profile' && (
               <div className="max-w-2xl bg-slate-900/40 border border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-md">
                  <h2 className="text-3xl font-black text-white mb-8 italic uppercase tracking-tighter">Account <span className="text-purple-500">Node</span></h2>
                  <div className="space-y-4">
                     <ProfileItem label="Identity" value={user?.name} />
                     <ProfileItem label="Email" value={user?.email} />
                     <ProfileItem label="Authorization" value={user?.role} highlight />
                  </div>
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Sub Components ---

const NavItem = ({ icon, label, active, onClick, collapsed }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative ${
      active 
      ? 'bg-gradient-to-r from-purple-600/20 to-transparent text-purple-400 border-l-2 border-purple-500 font-black shadow-lg shadow-purple-500/5' 
      : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'
    }`}
  >
    <div className={`${active ? 'text-purple-400' : 'group-hover:text-cyan-400'} transition-colors min-w-[22px]`}>
      {icon}
    </div>
    <span className={`text-xs uppercase tracking-[0.2em] transition-opacity duration-300 ${collapsed ? 'opacity-0 lg:hidden' : 'opacity-100'}`}>
      {label}
    </span>
  </button>
);

const StatCard = ({ label, value, icon }) => (
  <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] hover:border-slate-700 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="p-2 bg-slate-950 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
    <p className="text-3xl font-black text-white italic">{value}</p>
  </div>
);

const ProfileItem = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center py-5 border-b border-slate-800/50">
    <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{label}</span>
    <span className={`font-black ${highlight ? 'text-purple-400' : 'text-white'}`}>{value}</span>
  </div>
);

export default Dashboard;