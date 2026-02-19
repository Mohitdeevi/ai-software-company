import { jest } from '@jest/globals';

// ---------------------------------------------------------------------------
// Mock external services before importing the app
// ---------------------------------------------------------------------------

// Mock Redis client - for health check, we can control the mock
jest.unstable_mockModule('../../src/config/redis.js', () => ({
  getRedisClient: jest.fn(() => null),
  disconnectRedis: jest.fn(),
}));

// Mock BullMQ
jest.unstable_mockModule('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({}),
    close: jest.fn().mockResolvedValue(undefined),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock rate limiter
jest.unstable_mockModule('../../src/middleware/rateLimiter.js', () => ({
  authLimiter: (_req, _res, next) => next(),
  apiLimiter: (_req, _res, next) => next(),
  projectCreationLimiter: (_req, _res, next) => next(),
  createRateLimiter: () => (_req, _res, next) => next(),
}));

// Mock prom-client metrics middleware
jest.unstable_mockModule('../../src/middleware/metricsMiddleware.js', () => ({
  default: (_req, _res, next) => next(),
}));

// ---------------------------------------------------------------------------
// Dynamic imports
// ---------------------------------------------------------------------------

const { default: supertest } = await import('supertest');
const { default: app } = await import('../../src/app.js');

const request = supertest(app);

describe('Health Check API', () => {
  // =========================================================================
  // GET /health
  // =========================================================================
  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request.get('/health/health').expect(200);

      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeDefined();
      expect(typeof res.body.uptime).toBe('number');
    });

    it('returns a valid ISO timestamp', async () => {
      const res = await request.get('/health/health').expect(200);

      const date = new Date(res.body.timestamp);
      expect(date.toISOString()).toBe(res.body.timestamp);
    });
  });

  // =========================================================================
  // GET /ready
  // =========================================================================
  describe('GET /ready', () => {
    it('returns readiness status with service checks', async () => {
      // Note: In the test environment, MongoDB is connected (via MongoMemoryServer)
      // but Redis is mocked as null, so we expect a degraded response.
      const res = await request.get('/ready/ready');

      // Accept either 200 or 503 depending on service connectivity
      expect([200, 503]).toContain(res.status);
      expect(res.body.status).toBeDefined();
      expect(['ok', 'degraded']).toContain(res.body.status);
      expect(res.body.services).toBeDefined();
      expect(typeof res.body.services.mongodb).toBe('boolean');
      expect(typeof res.body.services.redis).toBe('boolean');
    });

    it('reports MongoDB as connected', async () => {
      const res = await request.get('/ready/ready');

      // MongoDB should be connected via MongoMemoryServer from setup.js
      expect(res.body.services.mongodb).toBe(true);
    });

    it('reports Redis as disconnected when mocked as null', async () => {
      const res = await request.get('/ready/ready');

      // Redis is mocked to return null, so it should be false
      expect(res.body.services.redis).toBe(false);
    });
  });
});
