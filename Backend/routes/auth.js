import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  authController.login
);

router.post('/logout', authController.logout);

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  [body('token').notEmpty(), body('newPassword').isLength({ min: 6 })],
  validate,
  authController.resetPassword
);

router.post(
  '/change-password',
  protect,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })],
  validate,
  authController.changePassword
);

export default router;
