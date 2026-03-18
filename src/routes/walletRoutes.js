import express from 'express';
import {deposit,withdraw, transfer,getHistory,getBalance} from '../controllers/walletController.js'

const router=express.Router();

router.post('/deposit',deposit);
router.post('/withdraw', withdraw);
router.post('/transfer', transfer);
router.get('/history/:userId', getHistory);
router.get('/balance/:userId', getBalance);
export default router;





