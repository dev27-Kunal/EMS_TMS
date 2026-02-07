import express from 'express';
import { protect } from '../middleware/auth.js';
import * as profileController from '../controllers/profileController.js';

const router = express.Router();

router.use(protect);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

export default router;
