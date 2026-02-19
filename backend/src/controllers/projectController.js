import archiver from 'archiver';
import { Queue } from 'bullmq';
import Project from '../models/Project.js';
import AgentExecution from '../models/AgentExecution.js';
import env from '../config/env.js';
import { getRedisClient } from '../config/redis.js';
import {
  AuthorizationError,
  NotFoundError,
} from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/* ------------------------------------------------------------------ */
/*  BullMQ orchestration queue (lazy-initialised)                      */
/* ------------------------------------------------------------------ */

let orchestrationQueue = null;

function getOrchestrationQueue() {
  if (!orchestrationQueue) {
    orchestrationQueue = new Queue('orchestration', {
      connection: getRedisClient(),
    });
  }
  return orchestrationQueue;
}

/* ------------------------------------------------------------------ */
/*  Ownership helper                                                   */
/* ------------------------------------------------------------------ */

/**
 * Fetch a project by id and verify the requesting user is the owner
 * (or has the admin role).
 *
 * @param {string} projectId
 * @param {object} reqUser - req.user payload from authenticate middleware.
 * @returns {Promise<import('mongoose').Document>}
 */
async function findProjectAndVerifyOwnership(projectId, reqUser) {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project');
  }

  if (
    project.userId.toString() !== reqUser.id &&
    reqUser.role !== 'admin'
  ) {
    throw new AuthorizationError('You do not own this project.');
  }

  return project;
}

/* ================================================================== */
/*  Route handlers                                                     */
/* ================================================================== */

/**
 * GET /api/projects
 *
 * List all projects belonging to the authenticated user.
 * Returns key metadata only (no generatedFiles content).
 */
export async function listProjects(req, res) {
  const projects = await Project.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      'name prompt status currentPhase currentAgent retryCount config tokenUsage githubRepo createdAt updatedAt'
    );

  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: { projects },
  });
}

/**
 * POST /api/projects
 *
 * Create a new project and queue it for orchestration.
 */
export async function createProject(req, res) {
  const { name, prompt, config } = req.body;

  const project = await Project.create({
    userId: req.user.id,
    name,
    prompt,
    config: {
      ...config,
      stack: config?.stack || 'node-mongo-next',
    },
  });

  // Enqueue for AI orchestration pipeline
  const queue = getOrchestrationQueue();
  await queue.add(
    'generate',
    { projectId: project._id.toString(), userId: req.user.id },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  logger.info({ projectId: project._id, userId: req.user.id }, 'Project created and queued');

  res.status(201).json({
    status: 'success',
    data: { project },
  });
}

/**
 * GET /api/projects/:id
 *
 * Get the full project document (including outputs) if the user owns it.
 */
export async function getProject(req, res) {
  const project = await findProjectAndVerifyOwnership(
    req.params.id,
    req.user
  );

  res.status(200).json({
    status: 'success',
    data: { project },
  });
}

/**
 * DELETE /api/projects/:id
 *
 * Delete a project and all related AgentExecution records.
 */
export async function deleteProject(req, res) {
  const project = await findProjectAndVerifyOwnership(
    req.params.id,
    req.user
  );

  // Remove related executions first
  await AgentExecution.deleteMany({ projectId: project._id });
  await project.deleteOne();

  logger.info({ projectId: project._id, userId: req.user.id }, 'Project deleted');

  res.status(200).json({
    status: 'success',
    message: 'Project deleted successfully.',
  });
}

/**
 * GET /api/projects/:id/files
 *
 * Return the generated files list (paths and languages, no content).
 */
export async function getProjectFiles(req, res) {
  const project = await findProjectAndVerifyOwnership(
    req.params.id,
    req.user
  );

  const files = (project.generatedFiles || []).map((f) => ({
    path: f.path,
    language: f.language,
  }));

  res.status(200).json({
    status: 'success',
    results: files.length,
    data: { files },
  });
}

/**
 * GET /api/projects/:id/files/:filePath
 *
 * Return the content of a single generated file identified by its path.
 * The filePath is passed as a wildcard route param (e.g. src/index.js).
 */
export async function getProjectFileContent(req, res) {
  const project = await findProjectAndVerifyOwnership(
    req.params.id,
    req.user
  );

  // filePath comes from a catch-all param (e.g. "0" suffix or the actual path)
  const filePath = req.params.filePath || req.params[0];

  const file = (project.generatedFiles || []).find(
    (f) => f.path === filePath
  );

  if (!file) {
    throw new NotFoundError('File');
  }

  res.status(200).json({
    status: 'success',
    data: {
      path: file.path,
      language: file.language,
      content: file.content,
    },
  });
}

/**
 * GET /api/projects/:id/logs
 *
 * Return the build log array for a project.
 */
export async function getProjectLogs(req, res) {
  const project = await findProjectAndVerifyOwnership(
    req.params.id,
    req.user
  );

  res.status(200).json({
    status: 'success',
    results: (project.buildLog || []).length,
    data: { logs: project.buildLog || [] },
  });
}

/**
 * GET /api/projects/:id/download
 *
 * Stream a ZIP archive of all generated files.
 */
export async function downloadProject(req, res) {
  const project = await findProjectAndVerifyOwnership(
    req.params.id,
    req.user
  );

  const files = project.generatedFiles || [];

  if (files.length === 0) {
    throw new NotFoundError('Generated files');
  }

  const safeName = project.name
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 50);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${safeName}.zip"`
  );

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    logger.error({ err, projectId: project._id }, 'Archive error');
    throw err;
  });

  archive.pipe(res);

  for (const file of files) {
    archive.append(file.content, { name: file.path });
  }

  await archive.finalize();
}

/**
 * POST /api/projects/:id/retry
 *
 * Reset a failed project to pending, increment retryCount, and re-queue.
 */
export async function retryProject(req, res) {
  const project = await findProjectAndVerifyOwnership(
    req.params.id,
    req.user
  );

  project.status = 'pending';
  project.currentPhase = null;
  project.currentAgent = null;
  project.retryCount += 1;
  await project.save();

  const queue = getOrchestrationQueue();
  await queue.add(
    'generate',
    { projectId: project._id.toString(), userId: req.user.id },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  logger.info(
    { projectId: project._id, retryCount: project.retryCount },
    'Project re-queued for retry'
  );

  res.status(200).json({
    status: 'success',
    data: { project },
  });
}

/**
 * GET /api/projects/:id/progress
 *
 * Server-Sent Events endpoint.
 * Subscribes to a Redis pub/sub channel for real-time project updates
 * and streams them to the client.
 */
export async function streamProgress(req, res) {
  const project = await findProjectAndVerifyOwnership(
    req.params.id,
    req.user
  );

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
  res.flushHeaders();

  // Create a dedicated Redis subscriber (ioredis duplicate)
  const redis = getRedisClient();
  const subscriber = redis.duplicate();

  const channel = `project:${project._id}:progress`;

  await subscriber.subscribe(channel);

  subscriber.on('message', (_ch, message) => {
    res.write(`data: ${message}\n\n`);
  });

  // Send an initial heartbeat so the client knows the connection is open
  res.write(`data: ${JSON.stringify({ type: 'connected', projectId: project._id })}\n\n`);

  // Keep-alive heartbeat every 30 seconds
  const heartbeatInterval = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  // Cleanup on client disconnect
  req.on('close', async () => {
    clearInterval(heartbeatInterval);
    await subscriber.unsubscribe(channel);
    subscriber.disconnect();
  });
}
