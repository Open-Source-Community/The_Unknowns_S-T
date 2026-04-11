import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const isPasswordStrong = (password) => {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

/**
 * Creates a new user and an associated wallet in Neon
 */
export const createNewUser = async (userData) => {
  const { email, password, role } = userData;

  if (!isPasswordStrong(password)) {
    throw new Error('WEAK_PASSWORD');
  }
  // Hash the password with a salt round of 10
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword, // Save the hash, not the plain text
      role: role,
      wallet: {
        create: {
          realBalance: 0,
          promoBalance: 0
        }
      }
    },
    include: { wallet: true }
  });

  // Exclude passwordHash before returning
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Fetches all users from the database
 */
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    include: { wallet: true }
  });
  
  // Strip passwordHash from all returned users
  return users.map(user => {
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

/**
 * Authenticates a user and generates a JWT
 */
export const loginUser = async (email, password) => {
  // 1. Find the user by email
  const user = await prisma.user.findUnique({ 
    where: { email } 
  });
  
  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // 2. Compare the provided password with the stored hash
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // 3. Strict check for JWT Secret
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET_MISSING');
  }

  // 4. Generate the JWT token
  // We include userId and role in the payload so other services can read it!
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '6h' } // Token expires in 6 hours
  );

  // 5. Exclude the password hash from the return object for security
  const { passwordHash, ...userWithoutPassword } = user;

  return { 
    user: userWithoutPassword, 
    token 
  };
};

export const getUserProfile = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      wallet: true 
    }
  });
};
