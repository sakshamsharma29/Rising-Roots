import express from 'express';
import {
  getTrades,
  createTrade,
  getTradeById,
  updateTrade,
  deleteTrade,
  closeTrade,
  getTradeStats,
} from '../controllers/tradesController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', getTradeStats);
router.get('/', getTrades);
router.post('/', createTrade);
router.get('/:id', getTradeById);
router.put('/:id', updateTrade);
router.delete('/:id', deleteTrade);
router.patch('/:id/close', closeTrade);
router.post('/:id/close', closeTrade);
router.put('/:id/close', closeTrade);

export default router;
