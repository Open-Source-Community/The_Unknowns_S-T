import { createNewUser, getAllUsers, loginUser, getUserProfile } from '../services/authService.js';

export const register = async (req, res) => {
  try {
    // 1. Extract exactly what we expect from the body
    const { email, password, role } = req.body;
    
    // 2. Input validation
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // 3. SECURITY: Force role to 'Buyer' on public registration (prevent privilege escalation)
    const safeUserData = {
      email,
      password,
      role: 'Buyer'
    };

    // 4. Pass only the sanitized object to the service
    const user = await createNewUser(safeUserData);
    res.status(201).json({
      success: true,
      message: "User and Wallet created successfully!",
      data: user
    });
  } catch (error) {
    console.error("Registration Error:", error);

    if (error.message === 'WEAK_PASSWORD') {
      return res.status(400).json({ 
        success: false, 
        error: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number." 
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: "Email already exists" });
    }
    
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const fetchUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ success: false, error: "Could not fetch users" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const authData = await loginUser(email, password);
    
    res.status(200).json({
      success: true,
      message: "Login successful!",
      data: authData
    });
  } catch (error) {
    console.error("Login Error:", error);
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }
    if (error.message === 'JWT_SECRET_MISSING') {
      return res.status(500).json({ success: false, error: "Server configuration error" });
    }
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { userId } = req.user; 

    const user = await getUserProfile(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
