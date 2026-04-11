import axios from 'axios';

const API = axios.create({
  
  baseURL: 'http://localhost:3001/api', 
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  }
});

// --- Request Interceptor ---
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Critical: Request Protocol Interrupted", error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor (The Security Guard) ---
API.interceptors.response.use(
  (response) => response, 
  
  (error) => {
    
    if (error.response && error.response.status === 401) {
      console.warn("Session Expired: Redirecting to Auth Node...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      window.location.href = '/login'; 
    }

    
    if (!error.response) {
      console.error("Vault Connection Lost: Check Server Status.");
    }

    return Promise.reject(error);
  }
);

export default API;