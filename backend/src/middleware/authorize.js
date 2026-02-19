import { AuthorizationError } from '../utils/errors.js';

/**
 * Role-Based Authorization Middleware Factory
 *
 * Accepts an array of allowed roles and returns middleware
 * that checks whether the authenticated user's role is
 * included in the allowed set.
 *
 * Must be used after the authenticate middleware so that
 * req.user is available.
 *
 * @param {string[]} allowedRoles - Roles permitted to access the route.
 * @returns {Function} Express middleware function.
 */
const authorize = (allowedRoles = []) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(
        new AuthorizationError('Authorization failed. User is not authenticated.')
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`
        )
      );
    }

    next();
  };
};

export default authorize;
