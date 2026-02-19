import { Worker } from 'bullmq';
import { getRedisClient } from '../../config/redis.js';
import { executeOrchestration } from '../../services/orchestrator.js';
import { logger } from '../../utils/logger.js';

let worker = null;

/**
 * Start the orchestration worker for the project-orchestration queue.
 */
export function startWorker() {
  if (worker) {
    logger.warn('Orchestration worker is already running');
    return worker;
  }

  worker = new Worker(
    'project-orchestration',
    async (job) => {
      const { projectId } = job.data;
      logger.info({ jobId: job.id, projectId }, 'Starting project orchestration');
      await executeOrchestration(projectId);
    },
    {
      connection: getRedisClient(),
    },
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, projectId: job.data.projectId }, 'Project orchestration completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, projectId: job?.data?.projectId, err }, 'Project orchestration failed');
  });

  worker.on('error', (err) => {
    logger.error({ err }, 'Orchestration worker error');
  });

  logger.info('Orchestration worker started');
  return worker;
}

/**
 * Gracefully stop the orchestration worker.
 */
export async function stopWorker() {
  if (!worker) {
    logger.warn('Orchestration worker is not running');
    return;
  }

  await worker.close();
  worker = null;
  logger.info('Orchestration worker stopped');
}
