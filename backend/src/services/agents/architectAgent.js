import { callLLM } from '../llmClient.js';
import { logger } from '../../utils/logger.js';

const SYSTEM_PROMPT = `You are the Architect Agent. Design a complete system architecture for a web application.

Tech stack: Node.js + Express + MongoDB + Mongoose + Redis + Next.js (App Router).

Define the following fields:
- architecture_type: The architectural pattern (e.g. "monolithic", "microservices", "modular-monolith").
- api_endpoints: Array of endpoint objects, each with:
  - method: HTTP method (GET, POST, PUT, DELETE, PATCH).
  - path: The URL path (e.g. "/api/users").
  - description: What this endpoint does.
- database_schema: Object with MongoDB collection names as keys. Each collection has:
  - fields: Array of { name, type, required, index } objects.
  - indexes: Array of compound index descriptions.
- redis_usage: Description of how Redis is used (caching, sessions, pub/sub, queues).
- folder_structure: Object representing the project directory tree.
- auth_architecture: Description of the authentication/authorization approach.
- security_model: Description of the security measures.

Return ONLY valid JSON with these exact keys. No markdown, no explanation.`;

/**
 * @param {{ prompt: string, prd: object, sprint_plan: object }} input
 * @returns {Promise<{ output: object, tokenUsage: object }>}
 */
export async function execute(input) {
  const { prompt, prd, sprint_plan } = input;

  const userPrompt = [
    `App idea:\n${prompt}`,
    `\nPRD:\n${JSON.stringify(prd, null, 2)}`,
    sprint_plan ? `\nSprint plan:\n${JSON.stringify(sprint_plan, null, 2)}` : '',
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
    logger.error({ err, text }, 'Architect agent: failed to parse LLM response');
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      output = JSON.parse(match[1].trim());
    } else {
      throw new Error('Architect agent returned invalid JSON');
    }
  }

  return { output, tokenUsage: usage };
}
