import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
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
import User from './models/User.js';
import Plan from './models/Plan.js';
import { seedInitialHistoryIfEmpty } from './controllers/historyController.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), db: 'mongodb' });
});

// Mounted API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/requests', joinRequestRoutes);
app.use('/api', apiRoutes);

// Static frontend serving for production & deployment
const distPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

// Fallback all other client routes to React SPA index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Auto-provision initial Admin and Plans if database is fresh
const ensureInitialSetup = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@risingroots.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(adminPassword, salt);
      await User.create({
        name: 'Desk Admin',
        email: adminEmail,
        passwordHash: hash,
        role: 'admin',
      });
      console.log(`✓ Dedicated Admin User created (${adminEmail} / ${adminPassword})`);
    }

    const planCount = await Plan.countDocuments();
    if (planCount === 0) {
      await Plan.create([
        {
          _id: 'starter',
          name: 'Crypto & Forex Starter',
          price: '$29/mo (₹2,499)',
          features: [
            '24/7 Live Crypto & Forex Feeds',
            'Basic BTC & ETH Option Chain',
            '$10,000 Paper Trading Simulator',
            'Community Discord Access',
          ],
          status: 'Active',
        },
        {
          _id: 'pro',
          name: 'Pro Signals & Option Desk',
          price: '$79/mo (₹6,499)',
          features: [
            'Full Option Chain with Greeks (Delta/IV)',
            'Max Pain & PCR Ratio Analysis',
            'In-Platform VIP Signals Room & Alerts',
            'Advanced Paper Trading with SL/TP',
            'Priority Desk Support',
          ],
          status: 'Active',
        },
        {
          _id: 'vip',
          name: 'Institutional VIP Desk',
          price: '$199/mo (₹15,999)',
          features: [
            'Everything in Pro included',
            '1-on-1 Mentorship with Desk Quant',
            'Custom Algo Trading Blueprints',
            'Multi-Exchange Order Flow & Heatmaps',
            'Direct WhatsApp & VIP Signals Room',
          ],
          status: 'Active',
        },
      ]);
      console.log('✓ Default Crypto & Forex Plans initialized in database');
    }

    await seedInitialHistoryIfEmpty();
  } catch (err) {
    console.error('Warning: Auto-provisioning check skipped:', err.message);
  }
};

const startServer = async () => {
  await connectDB();
  await ensureInitialSetup();

  // Run initial subscription expiry check & schedule daily check (every 24 hours)
  await checkAndExpireSubscriptions();
  setInterval(checkAndExpireSubscriptions, 24 * 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`🚀 Rising Roots Server listening on port ${PORT}`);
  });
};

startServer();
