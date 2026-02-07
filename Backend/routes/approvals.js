import express from 'express';
import { protect } from '../middleware/auth.js';
import * as approvalController from '../controllers/approvalController.js';

const router = express.Router();

router.use(protect);

router.get('/', approvalController.getApprovals);
router.get('/:id', approvalController.getApproval);
router.post('/:id/approve', approvalController.approveRequest);
router.post('/:id/reject', approvalController.rejectRequest);

export default router;
