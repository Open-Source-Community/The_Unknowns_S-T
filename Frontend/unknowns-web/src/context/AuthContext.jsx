import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { ENDPOINTS } from '../constants/apiEndpoints';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const verifyUser = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      
      const response = await API.get(ENDPOINTS.PROFILE);
      
      
      const userData = response.data.data;
      
      if (userData) {
        console.log("Profile Verified:", userData.email, "as", userData.role);
        setUser(userData); 
      }
    } catch (error) {
      console.error("Auth Verification Failed. Clearing session...");
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyUser();
  }, []);
  
  const login = (userData) => {
    
    localStorage.setItem('token', userData.token);
    
    
    setUser(userData.user);
    console.log("User Logged In:", userData.user.email);
  };



const register = async (formData) => {
  try {
    const response = await API.post(ENDPOINTS.REGISTER, formData);
    return response.data; 
  } catch (error) {
    
    const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Initialization Failed';
    throw errorMessage; 
  }
};
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    console.log("User Terminated.");
  };

  

const updateBalance = async () => {
  try {
    const response = await API.get(ENDPOINTS.WALLET);
    
   if (response && response.data && response.data.success) {
      const newBalance = response.data.balance;
      const newPromo = response.data.promoBalance;

      setUser(prevUser => {
        
        if (!prevUser) return null;

        return {
          ...prevUser,
          wallet: {
            ...prevUser.wallet,
            
            realBalance: newBalance || "0", 
            promoBalance: newPromo || "0"
          }
        };
      });
      
      console.log("Vault Synchronized | New Balance:", newBalance);
    }
  } catch (error) {
    console.error("Critical: Ledger Synchronization Failed", error);
  }
};
return (
  <AuthContext.Provider value={{ user, login, logout, register, loading, verifyUser, updateBalance }}>
    {children}
  </AuthContext.Provider>
);

};

export const useAuth = () => useContext(AuthContext);