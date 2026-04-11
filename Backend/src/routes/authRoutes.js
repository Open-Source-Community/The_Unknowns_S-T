import express from 'express';
import { register, fetchUsers, login, getProfile } from '../controllers/authController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', authenticateUser, authorizeRoles('Admin'), fetchUsers);
router.get('/profile', authenticateUser, getProfile);

export default router;
