import { Router } from 'express';
import client from 'prom-client';

const { register } = client;

// Collect default Node.js metrics (event loop lag, heap size, etc.)
client.collectDefaultMetrics({ register });

// --- Custom metrics ---

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
});

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
});

export const activeProjects = new client.Gauge({
  name: 'active_projects_total',
  help: 'Currently processing projects',
});

export const agentExecutionDuration = new client.Histogram({
  name: 'agent_execution_duration_seconds',
  help: 'Agent execution duration',
  labelNames: ['agent_name'],
  buckets: [1, 5, 10, 30, 60, 120],
});

export const llmTokensUsed = new client.Counter({
  name: 'llm_tokens_used_total',
  help: 'LLM tokens used',
  labelNames: ['agent_name', 'type'],
});

// --- Metrics endpoint ---

const router = Router();

router.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err.message);
  }
});

export default router;
