import express from 'express';
import { getOrgByCodeOrSlug, createOrganization } from '../controllers/orgController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/lookup', getOrgByCodeOrSlug);
router.post('/', authenticateToken, createOrganization);

export default router;
