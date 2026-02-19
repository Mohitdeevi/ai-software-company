import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { AuthenticationError } from '../utils/errors.js';

/**
 * JWT Authentication Middleware
 *
 * Extracts the Bearer token from the Authorization header,
 * verifies it against the configured secret, and attaches
 * the decoded user payload to req.user.
 */
const authenticate = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication required. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Authentication required. Token is malformed.');
    }

    const decoded = jwt.verify(token, env.jwt.secret);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid authentication token.'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Authentication token has expired.'));
    } else {
      next(new AuthenticationError('Authentication failed.'));
    }
  }
};

export default authenticate;
