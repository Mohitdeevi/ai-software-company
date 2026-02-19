import { AppError } from '../utils/errors.js';
import env from '../config/env.js';

/**
 * Centralized Error-Handling Middleware
 *
 * Catches all errors forwarded via next(err) and returns a
 * consistently shaped JSON response:
 *
 *   { success: false, error: { code, message, details? } }
 *
 * Handles the following error categories:
 *  - AppError (and subclasses) - operational errors raised intentionally
 *  - Mongoose ValidationError  - schema validation failures (400)
 *  - Mongoose CastError        - invalid ObjectId / type cast failures (400)
 *  - JWT JsonWebTokenError      - malformed or invalid tokens (401)
 *  - JWT TokenExpiredError      - expired tokens (401)
 *  - Unknown / unexpected errors - logged and returned as 500
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // ---- AppError (operational) ----------------------------------------
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // ---- Mongoose ValidationError --------------------------------------
  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => ({
      path: e.path,
      message: e.message,
      kind: e.kind,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Database validation failed.',
        details,
      },
    });
  }

  // ---- Mongoose CastError --------------------------------------------
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'CAST_ERROR',
        message: `Invalid value for ${err.path}: ${err.value}.`,
      },
    });
  }

  // ---- JWT JsonWebTokenError -----------------------------------------
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token.',
      },
    });
  }

  // ---- JWT TokenExpiredError -----------------------------------------
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired.',
      },
    });
  }

  // ---- Unknown / Unexpected errors -----------------------------------
  console.error(`[${req.requestId || 'no-request-id'}] Unhandled error:`, err);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        env.isProduction
          ? 'An unexpected error occurred. Please try again later.'
          : err.message || 'Internal server error.',
    },
  });
};

export default errorHandler;
