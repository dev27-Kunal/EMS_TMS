import express from 'express';
import { protect } from '../middleware/auth.js';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.get('/settings', notificationController.getSettings);
router.put('/settings', notificationController.updateSettings);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
