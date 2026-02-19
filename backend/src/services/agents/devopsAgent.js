import { callLLM } from '../llmClient.js';
import { logger } from '../../utils/logger.js';

const SYSTEM_PROMPT = `You are the DevOps Agent. Generate infrastructure and CI/CD configurations based on the system architecture.

Define the following fields:
- dockerfiles: Object with keys "backend" and "frontend", each containing the Dockerfile content string.
- docker_compose: The full docker-compose.yml content as a string.
- github_actions_ci: The CI workflow YAML content as a string.
- github_actions_cd: The CD workflow YAML content as a string.
- kubernetes_manifests: Object with the following keys, each containing the YAML content as a string:
  - deployment
  - service
  - ingress
  - configmap
  - secret
  - hpa

Return ONLY valid JSON with these exact keys. No markdown, no explanation.`;

/**
 * @param {{ prompt: string, architecture: object }} input
 * @returns {Promise<{ output: object, tokenUsage: object }>}
 */
export async function execute(input) {
  const { prompt, architecture } = input;

  const userPrompt = [
    `App idea:\n${prompt}`,
    `\nArchitecture:\n${JSON.stringify(architecture, null, 2)}`,
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
    logger.error({ err, text }, 'DevOps agent: failed to parse LLM response');
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      output = JSON.parse(match[1].trim());
    } else {
      throw new Error('DevOps agent returned invalid JSON');
    }
  }

  return { output, tokenUsage: usage };
}
