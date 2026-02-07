import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as jobController from '../controllers/jobController.js';

const router = express.Router();

router.use(protect);

router.get('/', jobController.getJobs);
router.get('/eligible-assignees', jobController.getEligibleAssignees);
router.get('/:id', jobController.getJob);
router.get('/:id/history', jobController.getJobHistory);
router.post(
  '/',
  [body('title').notEmpty(), body('department').notEmpty()],
  validate,
  jobController.createJob
);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);
router.post('/:id/assign', [body('assigneeId').optional()], validate, jobController.assignJob);

export default router;
