import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import * as agentController from '../controllers/agentController.js';

const router = Router();

// All agent routes require authentication and admin role
router.use(authenticate, authorize(['admin']));

// GET /projects/:projectId/executions - List all agent executions for a project
router.get('/projects/:projectId/executions', agentController.listExecutions);

// GET /executions/:id - Get a single agent execution by id
router.get('/executions/:id', agentController.getExecution);

export default router;
