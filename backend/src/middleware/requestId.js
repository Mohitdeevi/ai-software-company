import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID Middleware
 *
 * Generates a UUID v4 for every incoming request, attaches it
 * to req.requestId, and sets the X-Request-Id response header.
 * Downstream middleware and handlers can reference req.requestId
 * for correlated logging and tracing.
 */
const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || uuidv4();

  req.requestId = id;
  res.setHeader('X-Request-Id', id);

  next();
};

export default requestId;
