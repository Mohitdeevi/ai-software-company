import { callLLM } from '../llmClient.js';
import { logger } from '../../utils/logger.js';

const SYSTEM_PROMPT = `You are the Observability Agent. Define a complete monitoring and observability setup based on the architecture and DevOps plan.

Define the following fields:
- logging_config: Object describing the logging strategy (levels, format, transports, structured logging).
- metrics: Array of custom Prometheus metric objects, each with:
  - name: Metric name (e.g. "http_request_duration_seconds").
  - type: Metric type ("counter", "histogram", "gauge", "summary").
  - description: What this metric tracks.
  - labels: Array of label names.
- health_checks: Array of health check endpoint objects with path, checks performed, and expected response.
- alerting_rules: Array of alerting rule objects with name, condition, severity, and action.
- kubernetes_probes: Object with:
  - liveness: Probe configuration.
  - readiness: Probe configuration.
  - startup: Probe configuration (if applicable).

Return ONLY valid JSON with these exact keys. No markdown, no explanation.`;

/**
 * @param {{ architecture: object, devops_plan: object }} input
 * @returns {Promise<{ output: object, tokenUsage: object }>}
 */
export async function execute(input) {
  const { architecture, devops_plan } = input;

  const userPrompt = [
    `Architecture:\n${JSON.stringify(architecture, null, 2)}`,
    devops_plan
      ? `\nDevOps plan:\n${JSON.stringify(devops_plan, null, 2)}`
      : '',
  ].join('\n');

  const { text, usage } = await callLLM({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 8192,
  });

  let output;
  try {
    output = JSON.parse(text);
  } catch (err) {
    logger.error({ err, text }, 'Observability agent: failed to parse LLM response');
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      output = JSON.parse(match[1].trim());
    } else {
      throw new Error('Observability agent returned invalid JSON');
    }
  }

  return { output, tokenUsage: usage };
}
