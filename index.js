import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import walletRoutes from './src/routes/walletRoutes.js';

import productRoutes from './src/routes/productRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 3001;


const server = app.listen(PORT, () => {
 }).on('error', (err) => {
  console.error("SERVER ERROR:", err);
});

