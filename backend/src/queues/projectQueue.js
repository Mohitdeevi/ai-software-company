import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis.js';

const projectQueue = new Queue('project-orchestration', {
  connection: getRedisClient(),
  defaultJobOptions: {
    attempts: 1, // retries handled inside orchestrator
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

/**
 * Add a project orchestration job to the queue.
 * @param {string} projectId - The project ID to orchestrate.
 * @returns {Promise<import('bullmq').Job>} The enqueued job.
 */
export async function addProjectJob(projectId) {
  const job = await projectQueue.add('orchestrate', { projectId }, {
    jobId: `project-${projectId}`,
  });
  return job;
}

export default projectQueue;
