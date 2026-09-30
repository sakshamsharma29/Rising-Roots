import express from 'express';
import { getMyPortfolio, getCommunityPortfolio } from '../controllers/portfolioController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/me', getMyPortfolio);
router.get('/community', getCommunityPortfolio);

export default router;
