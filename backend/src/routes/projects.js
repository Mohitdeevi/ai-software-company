import { Router } from 'express';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import {
  createProjectSchema,
  projectIdSchema,
} from '../validators/projectSchemas.js';
import * as projectController from '../controllers/projectController.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// GET / - List all projects for the authenticated user
router.get('/', projectController.listProjects);

// POST / - Create a new project
router.post('/', validate(createProjectSchema), projectController.createProject);

// GET /:id - Get a single project by id
router.get('/:id', validate(projectIdSchema, 'params'), projectController.getProject);

// DELETE /:id - Delete a project by id
router.delete('/:id', validate(projectIdSchema, 'params'), projectController.deleteProject);

// GET /:id/files - List all generated files for a project
router.get('/:id/files', projectController.getProjectFiles);

// GET /:id/files/* - Get the content of a specific generated file
router.get('/:id/files/*', projectController.getProjectFileContent);

// GET /:id/logs - Get agent execution logs for a project
router.get('/:id/logs', projectController.getProjectLogs);

// GET /:id/download - Download the project as an archive
router.get('/:id/download', projectController.downloadProject);

// POST /:id/retry - Retry a failed project generation
router.post('/:id/retry', projectController.retryProject);

// GET /:id/stream - SSE endpoint for real-time progress updates
router.get('/:id/stream', projectController.streamProgress);

export default router;
