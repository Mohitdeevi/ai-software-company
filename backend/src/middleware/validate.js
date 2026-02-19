import { ValidationError } from '../utils/errors.js';

/**
 * Zod Validation Middleware Factory
 *
 * Accepts a Zod schema and an optional request source key,
 * then returns middleware that parses and validates the
 * corresponding request data. On success the raw data is
 * replaced with the parsed result (benefiting from Zod's
 * type coercion and default values). On failure a
 * ValidationError is forwarded to the error handler.
 *
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against.
 * @param {'body' | 'query' | 'params'} [source='body'] - Which part of the request to validate.
 * @returns {Function} Express middleware function.
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));

      return next(
        new ValidationError('Validation failed.', details)
      );
    }

    // Replace request data with the parsed (coerced / defaulted) result
    req[source] = result.data;

    next();
  };
};

export default validate;
