import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';
import apiRoutes from './routes/api.js';
import tradeRoutes from './routes/trades.js';
import portfolioRoutes from './routes/portfolio.js';
import aiRoutes from './routes/ai.js';
import subscriptionRoutes from './routes/subscriptions.js';
import orgRoutes from './routes/org.js';
import joinRequestRoutes from './routes/joinRequests.js';
import { checkAndExpireSubscriptions } from './controllers/subscriptionController.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), db: 'mongodb' });
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/requests', joinRequestRoutes);
app.use('/api', apiRoutes);

const startServer = async () => {
  await connectDB();

  // Run initial subscription expiry check & schedule daily check (every 24 hours)
  await checkAndExpireSubscriptions();
  setInterval(checkAndExpireSubscriptions, 24 * 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`🚀 Rising Roots Server listening on port ${PORT}`);
  });
};

startServer();
