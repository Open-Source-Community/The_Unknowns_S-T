import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticateUser, authorizeRoles } from './authMiddleware.js';

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  // Create a backup of the original environment variables right before the hooks
  const originalEnv = process.env;

  // Reset the mocks before every single test to prevent data bleeding!
  beforeEach(() => {
    // Inject a dummy secret into the test environment so the 500 error doesn't trigger
    process.env = { ...originalEnv, JWT_SECRET: 'test_secret_for_jest' };

    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    jest.clearAllMocks(); 
  });

  afterEach(() => {
    // Restore the original environment after each test so we don't pollute other test files
    process.env = originalEnv;
    jest.restoreAllMocks(); // Cleans up our jwt spies
  });

  // 1. The Missing Header
  it('should return 401 if no Authorization header is provided', () => {
    req.header.mockReturnValue(undefined);

    authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Access denied. No token provided.' });
    expect(next).not.toHaveBeenCalled();
  });

  // 2. The Malformed Header
  it('should return 401 if the header does not start with "Bearer "', () => {
    req.header.mockReturnValue('SecretToken 123456'); // Missing "Bearer "

    authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Access denied. No token provided.' });
    expect(next).not.toHaveBeenCalled();
  });

  // 3. The Expired Token (Specific Catch)
  it('should return 401 with specific message if token is expired', () => {
    req.header.mockReturnValue('Bearer expired_token_string');
    
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';
      throw error;
    });

    authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Token has expired.' });
    expect(next).not.toHaveBeenCalled();
  });

  // 4. The Invalid Token (General Catch)
  it('should return 401 if jwt.verify throws a general error', () => {
    req.header.mockReturnValue('Bearer fake_token_string');
    
    // Force jwt.verify to throw an error simulating a bad token
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      const error = new Error('invalid signature');
      error.name = 'JsonWebTokenError';
      throw error;
    });

    authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid token.' });
    expect(next).not.toHaveBeenCalled();
  });

  // 5. The Happy Path
  it('should attach decoded payload to req.user and call next() on success', () => {
    req.header.mockReturnValue('Bearer valid_token_string');
    const mockDecodedPayload = { userId: 99, role: 'BUYER' };
    
    // Force jwt.verify to succeed and return our mock payload
    jest.spyOn(jwt, 'verify').mockReturnValue(mockDecodedPayload);

    authenticateUser(req, res, next);

    expect(req.user).toEqual(mockDecodedPayload);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled(); // No errors should be sent
  });
});

describe('Authorize Roles Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {}; // Start with a blank request object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    jest.clearAllMocks();
  });

  // 1. The Fail-Safe Test
  it('should return 401 if req.user is completely missing', () => {
    // req.user is undefined (simulating a skipped authenticateUser middleware)
    const middleware = authorizeRoles('Admin');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized: User context missing.' });
    expect(next).not.toHaveBeenCalled();
  });

  // 2. The Forbidden Test
  it('should return 403 if user does not have the required role', () => {
    // User exists but has the wrong role
    req.user = { userId: 1, role: 'Buyer' }; 
    const middleware = authorizeRoles('Admin'); // Route strictly requires Admin
    
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Forbidden: You do not have permission to access this resource.' });
    expect(next).not.toHaveBeenCalled();
  });

  // 3. The Happy Path Test
  it('should call next() if the user has the required role', () => {
    // User exists and has the correct role
    req.user = { userId: 1, role: 'Admin' }; 
    const middleware = authorizeRoles('Admin', 'Seller'); // Route allows Admin or Seller
    
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled(); // No errors should be sent
  });
});
