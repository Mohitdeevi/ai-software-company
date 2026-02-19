import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter Middleware Factory
 *
 * Creates an express-rate-limit instance with in-memory store.
 * Redis-backed store can be added later when Redis is available.
 */
export const createRateLimiter = ({
  windowMs,
  max,
  keyGenerator,
  message = 'Too many requests. Please try again later.',
} = {}) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: keyGenerator || ((req) => req.ip),

    handler: (_req, res, _next, options) => {
      res.status(options.statusCode).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
        },
      });
    },
  });
};

/**
 * Auth routes limiter - 5 requests per minute.
 */
export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts. Please try again after 1 minute.',
});

/**
 * General API limiter - 100 requests per minute.
 */
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'API rate limit exceeded. Please slow down and try again shortly.',
});

/**
 * Project creation limiter - 10 requests per hour.
 */
export const projectCreationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Project creation limit reached. You may create up to 10 projects per hour.',
});
