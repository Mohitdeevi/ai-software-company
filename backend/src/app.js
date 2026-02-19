import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import env from './config/env.js';
import requestId from './middleware/requestId.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import agentRoutes from './routes/agents.js';
import healthRoutes from './routes/health.js';

const app = express();

// ---------------------------------------------------------------------------
// Global Middleware
// ---------------------------------------------------------------------------

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: env.cors.origin, credentials: true }));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Sanitize MongoDB query operators from user input
app.use(mongoSanitize());

// Request tracing
app.use(requestId);

// HTTP request logging
app.use(morgan(env.isDevelopment ? 'dev' : 'combined'));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/health', healthRoutes);
app.use('/ready', healthRoutes);

// ---------------------------------------------------------------------------
// Error Handling (must be registered last)
// ---------------------------------------------------------------------------

app.use(errorHandler);

export default app;
