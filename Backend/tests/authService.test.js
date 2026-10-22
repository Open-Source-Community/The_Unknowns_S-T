import { jest } from '@jest/globals';

// 1. Mock Prisma
const mockPrismaUserCreate = jest.fn();
const mockPrismaUserFindUnique = jest.fn();
const mockPrismaUserFindMany = jest.fn();

jest.unstable_mockModule('../src/config/prisma.js', () => ({
  default: {
    user: {
      create: mockPrismaUserCreate,
      findUnique: mockPrismaUserFindUnique,
      findMany: mockPrismaUserFindMany,
    },
  },
}));

// 2. Mock bcrypt
jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hash: jest.fn().mockResolvedValue('hashed_pw'),
    compare: jest.fn().mockImplementation((pw, hash) => pw === 'ValidPass123' && hash === 'hashed_pw'),
  },
}));

// 3. Mock jsonwebtoken
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn().mockReturnValue('mock_jwt_token'),
    verify: jest.fn(),
  },
}));

// 4. Import controllers and services after mocks are established
const { register, login } = await import('../src/controllers/authController.js');
const { createNewUser, loginUser } = await import('../src/services/authService.js');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Service & Registration Logic', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, JWT_SECRET: 'test_jwt_secret_auth' };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Registration Role Injection Prevention', () => {
    it('should force role: Buyer when user attempts to register as Admin via register controller', async () => {
      mockPrismaUserCreate.mockImplementation(async ({ data }) => ({
        id: 1,
        email: data.email,
        role: data.role,
        passwordHash: 'hashed_pw',
        wallet: { id: 1, realBalance: 0, promoBalance: 0 },
      }));

      const req = {
        body: {
          email: 'attacker@test.com',
          password: 'StrongPassword123',
          role: 'Admin',
        },
      };
      const res = mockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockPrismaUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'Buyer',
          }),
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            role: 'Buyer',
          }),
        })
      );
    });

    it('createNewUser service should strictly ignore incoming role and save Buyer', async () => {
      mockPrismaUserCreate.mockImplementation(async ({ data }) => ({
        id: 2,
        email: data.email,
        role: data.role,
        wallet: { id: 2 },
      }));

      const result = await createNewUser({
        email: 'attacker2@test.com',
        password: 'StrongPassword123',
        role: 'Admin',
      });

      expect(result.role).toBe('Buyer');
      expect(mockPrismaUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'Buyer',
          }),
        })
      );
    });

    it('createNewUser should throw WEAK_PASSWORD on weak password', async () => {
      await expect(
        createNewUser({
          email: 'weak@test.com',
          password: '123',
          role: 'Buyer',
        })
      ).rejects.toThrow('WEAK_PASSWORD');
    });
  });

  describe('Enforce isActive (Soft-deleted / Inactive Accounts)', () => {
    it('should reject login for inactive user (isActive === false) with INVALID_CREDENTIALS', async () => {
      mockPrismaUserFindUnique.mockResolvedValue({
        id: 10,
        email: 'inactive@test.com',
        passwordHash: 'hashed_pw',
        isActive: false,
        role: 'Buyer',
      });

      const req = {
        body: {
          email: 'inactive@test.com',
          password: 'ValidPass123',
        },
      };
      const res = mockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid email or password',
      });
    });

    it('loginUser service should throw INVALID_CREDENTIALS if user is inactive', async () => {
      mockPrismaUserFindUnique.mockResolvedValue({
        id: 11,
        email: 'inactive2@test.com',
        passwordHash: 'hashed_pw',
        isActive: false,
        role: 'Buyer',
      });

      await expect(loginUser('inactive2@test.com', 'ValidPass123')).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('loginUser should succeed for active user with valid password and return token', async () => {
      mockPrismaUserFindUnique.mockResolvedValue({
        id: 12,
        email: 'active@test.com',
        passwordHash: 'hashed_pw',
        isActive: true,
        role: 'Buyer',
      });

      const result = await loginUser('active@test.com', 'ValidPass123');

      expect(result.token).toBe('mock_jwt_token');
      expect(result.user.email).toBe('active@test.com');
      expect(result.user.passwordHash).toBeUndefined();
    });
  });
});
