import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as departmentController from '../controllers/departmentController.js';

const router = express.Router();

router.use(protect);

router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartment);
router.post('/', [body('name').notEmpty()], validate, departmentController.createDepartment);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

export default router;
