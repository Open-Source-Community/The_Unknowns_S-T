import express from 'express';
import * as productController from '../controllers/productController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. Public Route: Anyone (even un-authenticated guests) can view products
router.get('/', productController.getAllProducts); 

// 2. Protected Routes: Must be logged in AND have 'Seller' or 'Admin' role
router.post('/', authenticateUser, authorizeRoles('Seller'), productController.createProduct);
router.patch('/:id', authenticateUser, authorizeRoles('Seller'), productController.updateProduct);
router.delete('/:id', authenticateUser, authorizeRoles('Seller', 'Admin'), productController.deleteProduct);

export default router;
