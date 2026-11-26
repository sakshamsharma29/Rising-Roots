import express from 'express';
import {
  getMembers,
  addMember,
  updateMember,
  deleteMember,
  toggleMemberStatus,
  updateMemberKycStatus,
  getStats,
  getActivities,
  broadcastAnnouncement,
  getBroadcasts,
  deleteBroadcast,
} from '../controllers/membersController.js';
import { getPlans } from '../controllers/plansController.js';
import { getAnalytics } from '../controllers/analyticsController.js';
import {
  getHistoricalTrades,
  getHistoryStats,
  addHistoricalTrade,
  deleteHistoricalTrade,
} from '../controllers/historyController.js';
import {
  getDeltaTickersHandler,
  getDeltaOptionsHandler,
} from '../controllers/deltaController.js';
import {
  submitQuery,
  getAllQueries,
  updateQueryStatus,
} from '../controllers/queryController.js';

const router = express.Router();

// Members endpoints
router.get('/members/stats', getStats);
router.get('/members', getMembers);
router.post('/members', addMember);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);
router.patch('/members/:id/toggle', toggleMemberStatus);
router.patch('/members/:id/kyc', updateMemberKycStatus);

// Broadcast & Stats
router.post('/broadcast', broadcastAnnouncement);
router.get('/broadcasts', getBroadcasts);
router.delete('/broadcasts/:id', deleteBroadcast);
router.get('/stats', getStats);
router.get('/activities', getActivities);

// Plans & Analytics endpoints
router.get('/plans', getPlans);
router.get('/analytics', getAnalytics);

// Historical Trades & Track Record
router.get('/history/trades', getHistoricalTrades);
router.get('/history/stats', getHistoryStats);
router.post('/history/trades', addHistoricalTrade);
router.delete('/history/trades/:id', deleteHistoricalTrade);

// Delta Exchange Public APIs (Institutional Options & Tickers)
router.get('/delta/tickers', getDeltaTickersHandler);
router.get('/delta/options', getDeltaOptionsHandler);

// User Queries & Contact Messages
router.post('/queries', submitQuery);
router.get('/queries', getAllQueries);
router.patch('/queries/:id', updateQueryStatus);

export default router;
