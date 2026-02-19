import AgentExecution from '../models/AgentExecution.js';
import Project from '../models/Project.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

/* ================================================================== */
/*  Route handlers – Agent execution viewer (admin / debug)            */
/* ================================================================== */

/**
 * GET /api/projects/:projectId/executions
 *
 * List all agent executions for a given project.
 * Access: project owner or admin.
 */
export async function listExecutions(req, res) {
  const { projectId } = req.params;

  // Verify the project exists and the user has access
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project');
  }

  if (
    project.userId.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new AuthorizationError('You do not own this project.');
  }

  const executions = await AgentExecution.find({ projectId })
    .sort({ createdAt: 1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: executions.length,
    data: { executions },
  });
}

/**
 * GET /api/executions/:id
 *
 * Get a single agent execution by its id.
 * Access: owner of the parent project or admin.
 */
export async function getExecution(req, res) {
  const execution = await AgentExecution.findById(req.params.id).lean();

  if (!execution) {
    throw new NotFoundError('AgentExecution');
  }

  // Verify ownership via the parent project
  const project = await Project.findById(execution.projectId);

  if (!project) {
    throw new NotFoundError('Project');
  }

  if (
    project.userId.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new AuthorizationError('You do not own the parent project.');
  }

  res.status(200).json({
    status: 'success',
    data: { execution },
  });
}
