import { Router } from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis.js';

const router = Router();

// GET /health - Basic liveness check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// GET /ready - Readiness check (verifies external service connectivity)
router.get('/ready', async (_req, res) => {
  const services = {
    mongodb: false,
    redis: false,
  };

  // Check MongoDB connectivity
  try {
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    services.mongodb = mongoose.connection.readyState === 1;
  } catch {
    services.mongodb = false;
  }

  // Check Redis connectivity
  try {
    const redis = getRedisClient();
    if (redis && redis.status === 'ready') {
      await redis.ping();
      services.redis = true;
    }
  } catch {
    services.redis = false;
  }

  const allHealthy = Object.values(services).every(Boolean);

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    services,
  });
});

export default router;
