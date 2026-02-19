import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
} from '../../../src/utils/errors.js';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('creates an error with statusCode, code, and isOperational', () => {
      const error = new AppError('Something went wrong', 500, 'INTERNAL_ERROR');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('has statusCode 400 and code VALIDATION_ERROR', () => {
      const details = [{ path: 'email', message: 'Required' }];
      const error = new ValidationError('Validation failed.', details);

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Validation failed.');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual(details);
    });
  });

  describe('AuthenticationError', () => {
    it('has statusCode 401 and code AUTHENTICATION_ERROR', () => {
      const error = new AuthenticationError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.isOperational).toBe(true);
    });

    it('accepts a custom message', () => {
      const error = new AuthenticationError('Token expired');

      expect(error.message).toBe('Token expired');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('AuthorizationError', () => {
    it('has statusCode 403 and code AUTHORIZATION_ERROR', () => {
      const error = new AuthorizationError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Insufficient permissions');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.isOperational).toBe(true);
    });

    it('accepts a custom message', () => {
      const error = new AuthorizationError('Admin only');

      expect(error.message).toBe('Admin only');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('has statusCode 404 and code NOT_FOUND', () => {
      const error = new NotFoundError('Project');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Project not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.isOperational).toBe(true);
    });

    it('uses default resource name when none provided', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Resource not found');
    });
  });

  describe('ConflictError', () => {
    it('has statusCode 409 and code CONFLICT', () => {
      const error = new ConflictError('Email already exists');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('RateLimitError', () => {
    it('has statusCode 429 and code RATE_LIMIT_EXCEEDED', () => {
      const error = new RateLimitError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.isOperational).toBe(true);
    });

    it('accepts a custom message', () => {
      const error = new RateLimitError('Slow down');

      expect(error.message).toBe('Slow down');
      expect(error.statusCode).toBe(429);
    });
  });

  describe('ExternalServiceError', () => {
    it('has statusCode 502 and code EXTERNAL_SERVICE_ERROR', () => {
      const error = new ExternalServiceError('OpenAI', 'Service unavailable');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('OpenAI: Service unavailable');
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('inheritance chain', () => {
    it('all error classes are instances of Error', () => {
      const errors = [
        new ValidationError('test', []),
        new AuthenticationError(),
        new AuthorizationError(),
        new NotFoundError(),
        new ConflictError('test'),
        new RateLimitError(),
        new ExternalServiceError('svc', 'msg'),
      ];

      for (const error of errors) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
        expect(error.stack).toBeDefined();
      }
    });
  });
});
