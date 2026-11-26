import express from 'express';
import { registerUser, loginUser, getCurrentUser, submitKyc } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/kyc', submitKyc);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
