import { callLLM } from '../llmClient.js';
import { logger } from '../../utils/logger.js';

const SYSTEM_PROMPT = `You are the Security Agent. Review the architecture and backend plan to produce a comprehensive security plan.

Define the following fields:
- jwt_config: Object describing JWT configuration (algorithm, expiry, refresh strategy, storage).
- input_validation_rules: Array of validation rule objects with field, rule, and reason.
- rate_limiting_config: Object with rate limiting strategy per endpoint category.
- cors_policy: Object with allowed origins, methods, headers, and credentials config.
- dependency_audit_plan: Object describing how and when to audit npm dependencies.
- owasp_compliance_checklist: Array of OWASP Top 10 items with status and mitigation notes.

Return ONLY valid JSON with these exact keys. No markdown, no explanation.`;

/**
 * @param {{ architecture: object, backend_plan: object }} input
 * @returns {Promise<{ output: object, tokenUsage: object }>}
 */
export async function execute(input) {
  const { architecture, backend_plan } = input;

  const userPrompt = [
    `Architecture:\n${JSON.stringify(architecture, null, 2)}`,
    backend_plan
      ? `\nBackend plan:\n${JSON.stringify(backend_plan, null, 2)}`
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
    logger.error({ err, text }, 'Security agent: failed to parse LLM response');
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      output = JSON.parse(match[1].trim());
    } else {
      throw new Error('Security agent returned invalid JSON');
    }
  }

  return { output, tokenUsage: usage };
}
