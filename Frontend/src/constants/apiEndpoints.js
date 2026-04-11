export const BASE_URL = 'http://localhost:3001/api';

export const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  PRODUCTS: '/products',
  WALLET: '/wallet/balance',
  WALLET_TOPUP:  '/wallet/deposit',
  WALLET_WITHDRAW: '/wallet/withdraw',
  WALLET_TRANSFER: '/wallet/transfer',
  WALLET_HISTORY: '/wallet/history',
  ORDERS: '/orders',


};

export const ROLES = {
  ADMIN: 'Admin',
  BUYER: 'Buyer',
  SELLER: 'Seller',
};

export const CATEGORIES = ["All", "Scripts", "UI Kits", "Templates", "Source Code"];

