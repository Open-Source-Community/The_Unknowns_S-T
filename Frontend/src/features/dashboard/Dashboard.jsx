import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/apiEndpoints';
import Marketplace from '../marketplace/Marketplace.jsx';
import AdminPanel from '../adminPanel/AdminPanel.jsx';
import SellerOverview from '../sellerOverview/SellerOverview.jsx';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {user?.role === ROLES.SELLER && <SellerOverview />}
      {user?.role === ROLES.ADMIN && <AdminPanel />}
      {user?.role === ROLES.BUYER && <Marketplace />}
    </div>
  );
};

export default Dashboard;