import prisma from '../config/prisma.js';

/**
 * Creates a new user and an associated wallet in Neon
 */
export const createNewUser = async (userData) => {
  const { email, password, role } = userData;

  return await prisma.user.create({
    data: {
      email,
      passwordHash: password, // Still plain text for now
      role: role || 'Buyer',
      wallet: {
        create: {
          realBalance: 0,
          promoBalance: 0
        }
      }
    },
    include: { wallet: true }
  });
};

/**
 * Fetches all users from the database
 */
export const getAllUsers = async () => {
  return await prisma.user.findMany({
    include: { wallet: true }
  });
};