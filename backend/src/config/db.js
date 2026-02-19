import mongoose from 'mongoose';
import env from './env.js';
import { logger } from '../utils/logger.js';

export async function connectDB() {
  try {
    await mongoose.connect(env.mongodb.uri);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failed');
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
