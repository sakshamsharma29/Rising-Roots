import express from 'express';
import {
  getMembers,
  addMember,
  updateMember,
  deleteMember,
  toggleMemberStatus,
  getStats,
  getActivities,
  broadcastAnnouncement,
} from '../controllers/membersController.js';
import { getPlans } from '../controllers/plansController.js';
import { getAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// Members endpoints
router.get('/members/stats', getStats);
router.get('/members', getMembers);
router.post('/members', addMember);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);
router.patch('/members/:id/toggle', toggleMemberStatus);

// Broadcast & Stats
router.post('/broadcast', broadcastAnnouncement);
router.get('/stats', getStats);
router.get('/activities', getActivities);

// Plans & Analytics endpoints
router.get('/plans', getPlans);
router.get('/analytics', getAnalytics);

export default router;
