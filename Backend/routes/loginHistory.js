import express from 'express';
import { protect } from '../middleware/auth.js';
import * as loginHistoryController from '../controllers/loginHistoryController.js';

const router = express.Router();

router.use(protect);

router.get('/', loginHistoryController.getLoginHistory);
router.get('/:id', loginHistoryController.getLoginRecord);

export default router;
