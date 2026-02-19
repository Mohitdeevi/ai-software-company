import { jest } from '@jest/globals';

// ---------------------------------------------------------------------------
// Mock external services before importing the app
// ---------------------------------------------------------------------------

// Mock Redis client
jest.unstable_mockModule('../../src/config/redis.js', () => ({
  getRedisClient: jest.fn(() => null),
  disconnectRedis: jest.fn(),
}));

// Mock BullMQ so project creation does not require a real Redis connection
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
const { default: User } = await import('../../src/models/User.js');
const { default: Project } = await import('../../src/models/Project.js');

const request = supertest(app);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

import { validUser } from '../fixtures/users.js';
import { validProject, invalidProjects } from '../fixtures/projects.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Register a user and return the access token.
 */
async function registerAndGetToken(userData = validUser) {
  const res = await request.post('/api/v1/auth/register').send(userData);
  return res.body.data.accessToken;
}

describe('Projects API - /api/v1/projects', () => {
  let token;

  beforeEach(async () => {
    token = await registerAndGetToken();
  });

  // =========================================================================
  // POST /api/v1/projects
  // =========================================================================
  describe('POST /api/v1/projects', () => {
    it('creates a project and returns 201', async () => {
      const res = await request
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(validProject)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.project).toBeDefined();
      expect(res.body.data.project.name).toBe(validProject.name);
      expect(res.body.data.project.prompt).toBe(validProject.prompt);
      expect(res.body.data.project.status).toBe('pending');
    });

    it('returns 400 for invalid data (missing name)', async () => {
      const res = await request
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ prompt: validProject.prompt })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for invalid data (prompt too short)', async () => {
      const res = await request
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test', prompt: 'Short' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 401 without authentication', async () => {
      const res = await request
        .post('/api/v1/projects')
        .send(validProject)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // GET /api/v1/projects
  // =========================================================================
  describe('GET /api/v1/projects', () => {
    it("returns the authenticated user's projects", async () => {
      // Create two projects
      await request
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(validProject);

      await request
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Second Project', prompt: 'Build a chat application with real-time messaging' });

      const res = await request
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.results).toBe(2);
      expect(res.body.data.projects).toHaveLength(2);
    });

    it('returns empty array when user has no projects', async () => {
      const res = await request
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.results).toBe(0);
      expect(res.body.data.projects).toHaveLength(0);
    });

    it('does not return other users projects', async () => {
      // Create a project with the first user
      await request
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(validProject);

      // Register a second user and query their projects
      const otherToken = await registerAndGetToken({
        email: 'other@example.com',
        password: 'OtherPass123!',
        name: 'Other User',
      });

      const res = await request
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      expect(res.body.results).toBe(0);
      expect(res.body.data.projects).toHaveLength(0);
    });
  });

  // =========================================================================
  // GET /api/v1/projects/:id
  // =========================================================================
  describe('GET /api/v1/projects/:id', () => {
    it('returns a project by id', async () => {
      const createRes = await request
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(validProject);

      const projectId = createRes.body.data.project._id;

      const res = await request
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.project._id).toBe(projectId);
      expect(res.body.data.project.name).toBe(validProject.name);
    });

    it('returns 404 for non-existent id', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await request
        .get(`/api/v1/projects/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it("returns 403 for another user's project", async () => {
      // Create a project with the first user
      const createRes = await request
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(validProject);

      const projectId = createRes.body.data.project._id;

      // Register a second user
      const otherToken = await registerAndGetToken({
        email: 'other2@example.com',
        password: 'OtherPass123!',
        name: 'Other User 2',
      });

      const res = await request
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('returns 400 for invalid id format', async () => {
      const res = await request
        .get('/api/v1/projects/not-a-valid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // DELETE /api/v1/projects/:id
  // =========================================================================
  describe('DELETE /api/v1/projects/:id', () => {
    it('deletes a project and returns success', async () => {
      const createRes = await request
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(validProject);

      const projectId = createRes.body.data.project._id;

      const res = await request
        .delete(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Project deleted successfully.');

      // Verify it no longer exists
      const check = await request
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(check.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 404 when deleting a non-existent project', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await request
        .delete(`/api/v1/projects/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it("returns 403 when deleting another user's project", async () => {
      const createRes = await request
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(validProject);

      const projectId = createRes.body.data.project._id;

      const otherToken = await registerAndGetToken({
        email: 'other3@example.com',
        password: 'OtherPass123!',
        name: 'Other User 3',
      });

      const res = await request
        .delete(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // POST /api/v1/projects/:id/retry
  // =========================================================================
  describe('POST /api/v1/projects/:id/retry', () => {
    it('retries a project and increments retryCount', async () => {
      const createRes = await request
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(validProject);

      const projectId = createRes.body.data.project._id;

      // Manually set the project status to 'failed' so retry makes sense
      await Project.findByIdAndUpdate(projectId, { status: 'failed' });

      const res = await request
        .post(`/api/v1/projects/${projectId}/retry`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.project.status).toBe('pending');
      expect(res.body.data.project.retryCount).toBe(1);
    });

    it('returns 404 for non-existent project', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await request
        .post(`/api/v1/projects/${fakeId}/retry`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('returns 401 without authentication', async () => {
      const res = await request
        .post('/api/v1/projects/507f1f77bcf86cd799439011/retry')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
