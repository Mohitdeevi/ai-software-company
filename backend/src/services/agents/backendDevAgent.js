import { callLLM } from '../llmClient.js';
import { logger } from '../../utils/logger.js';

const SYSTEM_PROMPT = `You are the Backend Developer Agent. Generate a backend implementation plan based on the system architecture.

Stack: Node.js, Express, MongoDB, Mongoose, Redis.

Define the following fields:
- files: Array of file objects, each with:
  - path: Relative file path (e.g. "src/controllers/userController.js").
  - content: The full file source code.
  - language: Programming language (e.g. "javascript").
- models: Array of Mongoose model descriptions with fields and validations.
- controllers: Array of controller names with their responsibilities.
- routes: Array of route modules with their endpoint mappings.
- middleware: Array of middleware descriptions (auth, validation, error handling).
- environment_variables: Array of required env vars with descriptions.

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
    logger.error({ err, text }, 'Backend Dev agent: failed to parse LLM response');
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      output = JSON.parse(match[1].trim());
    } else {
      throw new Error('Backend Dev agent returned invalid JSON');
    }
  }

  return { output, tokenUsage: usage };
}
