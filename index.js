import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import walletRoutes from './src/routes/walletRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes Integration
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});