import Redis from 'ioredis';
import env from './env.js';
import { logger } from '../utils/logger.js';

let redisClient = null;

export function getRedisClient() {
  if (redisClient) return redisClient;

  redisClient = new Redis(env.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy(times) {
      if (times > 5) {
        logger.warn('Redis unavailable after 5 retries — giving up');
        return null;
      }
      return Math.min(times * 500, 3000);
    },
  });

  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('error', (err) => {
    // Only log once to avoid spam
    if (err.code === 'ECONNREFUSED') {
      logger.warn(`Redis connection refused at ${env.redis.url}`);
    } else {
      logger.error({ err }, 'Redis error');
    }
  });
  redisClient.on('close', () => logger.warn('Redis connection closed'));

  return redisClient;
}

export async function disconnectRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      // ignore disconnect errors
    }
    redisClient = null;
    logger.info('Redis disconnected');
  }
}
