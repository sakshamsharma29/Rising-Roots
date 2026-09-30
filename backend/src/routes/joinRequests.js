import express from 'express';
import {
  submitJoinRequest,
  getPendingJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from '../controllers/joinRequestController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit', submitJoinRequest);
router.get('/pending', authenticateToken, getPendingJoinRequests);
router.post('/approve/:id', authenticateToken, approveJoinRequest);
router.post('/reject/:id', authenticateToken, rejectJoinRequest);

export default router;
