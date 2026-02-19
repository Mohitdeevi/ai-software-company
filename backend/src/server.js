import app from './app.js';
import env from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { getRedisClient, disconnectRedis } from './config/redis.js';
import { logger } from './utils/logger.js';

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function start() {
  // Connect to MongoDB
  await connectDB();

  // Initialise Redis client (creates connection on first call)
  getRedisClient();

  // Start HTTP server
  const server = app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port} [${env.nodeEnv}]`);
  });

  // -------------------------------------------------------------------------
  // Graceful Shutdown
  // -------------------------------------------------------------------------

  const shutdown = async (signal) => {
    logger.info(`${signal} received — starting graceful shutdown`);

    // Stop accepting new connections
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await disconnectDB();
        await disconnectRedis();
        logger.info('All connections closed — exiting');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      }
    });

    // Force exit if graceful shutdown takes too long (10 s)
    setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
