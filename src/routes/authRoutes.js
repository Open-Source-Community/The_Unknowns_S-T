import express from 'express';
import { register, fetchUsers } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.get('/users', fetchUsers);

export default router;