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

// Mock rate limiter so it does not interfere with tests
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
// Dynamic imports (must happen after mocks are registered)
// ---------------------------------------------------------------------------

const { default: supertest } = await import('supertest');
const { default: app } = await import('../../src/app.js');
const { default: User } = await import('../../src/models/User.js');

const request = supertest(app);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

import { validUser, invalidUsers } from '../fixtures/users.js';

describe('Auth API - /api/v1/auth', () => {
  // =========================================================================
  // POST /register
  // =========================================================================
  describe('POST /api/v1/auth/register', () => {
    it('creates a new user and returns 201 with access token', async () => {
      const res = await request
        .post('/api/v1/auth/register')
        .send(validUser)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.name).toBe(validUser.name);
      // Password hash should never be returned
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('returns 409 for duplicate email', async () => {
      // Register the first time
      await request.post('/api/v1/auth/register').send(validUser);

      // Attempt to register again with the same email
      const res = await request
        .post('/api/v1/auth/register')
        .send(validUser)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('returns 400 for invalid data (missing email)', async () => {
      const res = await request
        .post('/api/v1/auth/register')
        .send({ password: 'Password123!', name: 'No Email' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for invalid data (short password)', async () => {
      const res = await request
        .post('/api/v1/auth/register')
        .send({ email: 'short@example.com', password: 'Ab1!', name: 'Short' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for empty body', async () => {
      const res = await request
        .post('/api/v1/auth/register')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // POST /login
  // =========================================================================
  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Seed a registered user for login tests
      await request.post('/api/v1/auth/register').send(validUser);
    });

    it('returns 200 with token for valid credentials', async () => {
      const res = await request
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('returns 401 for wrong password', async () => {
      const res = await request
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: 'WrongPassword123!' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('returns 401 for non-existent email', async () => {
      const res = await request
        .post('/api/v1/auth/login')
        .send({ email: 'ghost@example.com', password: 'Password123!' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });

  // =========================================================================
  // GET /me
  // =========================================================================
  describe('GET /api/v1/auth/me', () => {
    it('returns user profile with valid token', async () => {
      const registerRes = await request
        .post('/api/v1/auth/register')
        .send(validUser);

      const token = registerRes.body.data.accessToken;

      const res = await request
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.name).toBe(validUser.name);
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('returns 401 without token', async () => {
      const res = await request.get('/api/v1/auth/me').expect(401);

      expect(res.body.success).toBe(false);
    });

    it('returns 401 with invalid token', async () => {
      const res = await request
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalidtoken123')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // POST /refresh
  // =========================================================================
  describe('POST /api/v1/auth/refresh', () => {
    it('returns new access token when valid refresh cookie is present', async () => {
      const registerRes = await request
        .post('/api/v1/auth/register')
        .send(validUser);

      // Extract the refreshToken cookie from the Set-Cookie header
      const cookies = registerRes.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const refreshCookie = Array.isArray(cookies)
        ? cookies.find((c) => c.startsWith('refreshToken='))
        : cookies;

      const res = await request
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('returns 401 when no refresh cookie is present', async () => {
      const res = await request.post('/api/v1/auth/refresh').expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // POST /logout
  // =========================================================================
  describe('POST /api/v1/auth/logout', () => {
    it('clears refresh token and returns success', async () => {
      const registerRes = await request
        .post('/api/v1/auth/register')
        .send(validUser);

      const token = registerRes.body.data.accessToken;

      const res = await request
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Logged out successfully.');

      // Verify the refresh token was cleared on the user document
      const user = await User.findOne({ email: validUser.email }).select(
        '+refreshToken'
      );
      expect(user.refreshToken).toBeNull();
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request.post('/api/v1/auth/logout').expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
