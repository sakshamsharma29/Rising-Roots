import express from 'express';
import { renewMemberSubscription, getExpiringMembers } from '../controllers/subscriptionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/expiring', getExpiringMembers);
router.post('/renew/:id', renewMemberSubscription);

export default router;
