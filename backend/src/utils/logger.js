import pino from 'pino';
import env from '../config/env.js';

export const logger = pino({
  level: env.log.level,
  ...(env.isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' },
    },
  }),
  ...(env.isProduction && {
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
});
