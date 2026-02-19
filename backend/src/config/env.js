import dotenv from 'dotenv';
dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/promptcorp',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiry: process.env.JWT_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  llm: {
    apiKey: process.env.LLM_API_KEY,
    apiUrl: process.env.LLM_API_URL || 'https://api.anthropic.com/v1',
    model: process.env.LLM_MODEL || 'claude-sonnet-4-6',
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};

export default env;
