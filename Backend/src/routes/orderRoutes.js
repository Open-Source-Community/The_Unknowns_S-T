import express from 'express';
import { createOrder, getMyOrders, cancelOrder } from '../controllers/orderController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { validateIdempotency } from '../middlewares/walletMiddleware.js';

const router = express.Router();

// All order operations require the user to be logged in
router.use(authenticateUser);

router.post('/', validateIdempotency, createOrder);
router.get('/', getMyOrders);
router.patch('/:id/cancel', validateIdempotency, cancelOrder);

export default router;
