import jwt from 'jsonwebtoken';

/**
 * Middleware to protect routes. 
 * Extracts the JWT from the Authorization header and verifies it.
 */
export const authenticateUser = (req, res, next) => {
  // 1. Check if the Authorization header exists
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  // 2. Extract the token (Remove "Bearer " from the string)
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify the token using our secret key
    if(!process.env.JWT_SECRET)
      return res.status(500).json({ success: false, error: 'Missed configuration.' });

    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach the decoded user info (userId, role) to the request object
    req.user = decodedPayload;
    
    // 5. Pass control to the next middleware or controller
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token has expired.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware.
 * Must be used AFTER authenticateUser.
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Ensure the user object exists (in case authenticateUser was skipped)
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User context missing.'});
    }

    // 2. Check if the user's role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden: You do not have permission to access this resource.' 
      });
    }

    // 3. User is authorized, proceed
    next();
  };
};
