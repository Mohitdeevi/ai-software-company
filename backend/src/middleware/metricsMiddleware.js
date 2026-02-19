import { httpRequestsTotal, httpRequestDuration } from '../routes/metrics.js';

/**
 * Express middleware that records HTTP request metrics
 * (request count and duration) using prom-client.
 */
export default function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationNs = Number(process.hrtime.bigint() - start);
    const durationSeconds = durationNs / 1e9;

    // Prefer the matched route pattern (e.g. /projects/:id) over the raw path
    // to avoid high-cardinality labels.
    const path = req.route?.path || req.path;

    httpRequestsTotal.inc({
      method: req.method,
      path,
      status: res.statusCode,
    });

    httpRequestDuration.observe(
      { method: req.method, path },
      durationSeconds,
    );
  });

  next();
}
