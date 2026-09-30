import express from 'express';
import { analyzeTrade, getPatternInsights, chatWithAi } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/analyze', analyzeTrade);
router.get('/insights', getPatternInsights);
router.post('/chat', chatWithAi);

export default router;
