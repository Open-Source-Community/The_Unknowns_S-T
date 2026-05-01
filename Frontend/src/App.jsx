import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import LandingPage from './features/landing/LandingPage';
import Marketplace from './features/marketplace/Marketplace'; 
import { AuthenticatedNavbar } from './components/AuthenticatedNavbar';
import { Navbar } from './components/Navbar';
import { AsidePart } from './components/AsidePart'; 
import WalletHub from './features/Wallet/WalletHub.jsx';
import Profile from './features/auth/profile.jsx';
import OrdersHistory from './features/orders/OrdersHistory.jsx';
import SellerInventory from './features/sellerInventory/SellerInventory.jsx';
import AdminPanel from './features/adminPanel/AdminPanel.jsx';
import AddProductModal from './features/products/AddProductModal.jsx';
import ProductDetails from './features/marketplace/ProductDetails.jsx';
import { ROLES } from './constants/apiEndpoints';

function App() {
  const { user, loading, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Auto-close sidebar on user change (login/logout)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [user?.id]);

  const handleProductAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
  );

  return (
    
<div className="flex h-screen w-full bg-[#020617] overflow-hidden font-sans">
{user && isSidebarOpen && (
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[65] cursor-pointer" 
        onClick={() => setIsSidebarOpen(false)} 
      />
    )}
    
      {user && (
        <AsidePart 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
          user={user}
          logout={logout}
          setIsModalOpen={setIsModalOpen}
        />
      )}

    
<div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-500`}>
        {user ? (
          <AuthenticatedNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        ) : (
          <Navbar />
        )}

  <main className="flex-1 overflow-y-auto custom-scrollbar relative px-6 py-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -z-10" />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/:id" element={<ProductDetails />} />
            <Route path="/inventory" element={user?.role === ROLES.SELLER ? <SellerInventory key={refreshTrigger} setIsModalOpen={setIsModalOpen} /> : <Navigate to="/dashboard" />} />
            <Route path="/admin" element={user?.role === ROLES.ADMIN ? <AdminPanel /> : <Navigate to="/dashboard" />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wallet" element={user ? <WalletHub /> : <Navigate to="/login" />} />
            <Route path="/orders" element={<OrdersHistory />} />
          </Routes>

          {user?.role === ROLES.SELLER && (
            <AddProductModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)}
              onProductAdded={handleProductAdded}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;