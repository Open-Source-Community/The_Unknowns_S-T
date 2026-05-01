import express from 'express';
import {deposit,withdraw, transfer,getHistory,getBalance, getAllWalletsForAdmin} from '../controllers/walletController.js'
import { authenticateUser , authorizeRoles} from '../middlewares/authMiddleware.js';
import { validateIdempotency} from '../middlewares/walletMiddleware.js';

const router=express.Router();

router.use(authenticateUser);
// user routes
router.post('/deposit',validateIdempotency,deposit);
router.post('/withdraw',validateIdempotency, withdraw);
router.post('/transfer',validateIdempotency,transfer);
router.get('/history',getHistory);
router.get('/balance',getBalance);

// admin routes
router.get('/admin/all-wallets', authorizeRoles('Admin'), getAllWalletsForAdmin);
export default router;





