import { createNewUser, getAllUsers } from '../services/authService.js';

export const register = async (req, res) => {
  try {
    const user = await createNewUser(req.body);
    res.status(201).json({
      success: true,
      message: "User and Wallet created successfully!",
      data: user
    });
  } catch (error) {
    console.error("Registration Error:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch users" });
  }
};