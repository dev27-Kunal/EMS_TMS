import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect, restrict } from '../middleware/auth.js';
import * as employeeController from '../controllers/employeeController.js';

const router = express.Router();
const adminRoles = ['system_admin', 'hr_admin', 'gm', 'manager', 'supervisor'];

router.use(protect);

router.get('/', employeeController.getEmployees);
router.get('/reporting-managers', employeeController.getReportingManagers);
router.get('/:id', employeeController.getEmployee);
router.post(
  '/',
  restrict(...adminRoles),
  [
    body('employeeId').notEmpty(),
    body('name').notEmpty(),
    body('email').isEmail(),
    body('department').notEmpty(),
    body('position').notEmpty(),
    body('hireDate').notEmpty(),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  employeeController.createEmployee
);
router.put(
  '/:id',
  restrict(...adminRoles),
  [
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  employeeController.updateEmployee
);
router.delete('/:id', restrict(...adminRoles), employeeController.deleteEmployee);

export default router;
