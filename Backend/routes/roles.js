import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as roleController from '../controllers/roleController.js';

const router = express.Router();

router.use(protect);

router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRole);
router.post(
  '/',
  [body('name').notEmpty(), body('code').notEmpty()],
  validate,
  roleController.createRole
);
router.put('/:id', roleController.updateRole);

export default router;
