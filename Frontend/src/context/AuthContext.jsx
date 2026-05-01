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
      // Fetch profile and wallet balance in parallel
      const [profileRes, walletRes] = await Promise.allSettled([
        API.get(ENDPOINTS.PROFILE),
        API.get(ENDPOINTS.WALLET),
      ]);

      const userData = profileRes.status === 'fulfilled' ? profileRes.value.data.data : null;

      if (userData) {
        const storedName = localStorage.getItem(`name_${userData.email}`);
        const walletData = walletRes.status === 'fulfilled' && walletRes.value.data.success
          ? { realBalance: walletRes.value.data.balance || '0', promoBalance: walletRes.value.data.promoBalance || '0' }
          : userData.wallet;

        const userWithName = {
          ...userData,
          name: storedName || userData.name,
          wallet: { ...userData.wallet, ...walletData },
        };

        console.log("Profile Verified:", userWithName.email, "as", userWithName.role);
        setUser(userWithName);
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
    
    // Attempt to pull name from storage if it exists for this email
    const storedName = localStorage.getItem(`name_${userData.user.email}`);
    const userWithName = { ...userData.user, name: storedName || userData.user.name };
    
    setUser(userWithName);
    console.log("User Logged In:", userWithName.email);
  };



const register = async (formData) => {
  try {
    const { name, ...apiData } = formData;
    const response = await API.post(ENDPOINTS.REGISTER, apiData);
    
    // Store name locally since backend doesn't support it
    if (name) {
      localStorage.setItem(`name_${formData.email}`, name);
    }
    
    return response.data; 
  } catch (error) {
    
    let errorMessage = 'Initialization Failed';
    if (error.response) {
      const serverMsg = error.response.data?.message;
      errorMessage = Array.isArray(serverMsg) ? serverMsg[0] : serverMsg || 'Invalid Data';
    } else if (error.request) {
      errorMessage = 'Vault Connection Lost. Server Unreachable.';
    }
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