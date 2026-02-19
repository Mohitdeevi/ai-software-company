import { callLLM } from '../llmClient.js';
import { logger } from '../../utils/logger.js';

const SYSTEM_PROMPT = `You are the Frontend Developer Agent. Generate a frontend implementation plan based on the system architecture and API endpoints.

Stack: Next.js App Router, React, TailwindCSS.

Define the following fields:
- files: Array of file objects, each with:
  - path: Relative file path (e.g. "app/page.tsx").
  - content: The full file source code.
  - language: Programming language (e.g. "typescript").
- pages: Array of page descriptions with route, purpose, and key components.
- components: Array of reusable component descriptions with props and purpose.
- state_management: Description of state management approach (React Context, Zustand, etc.).
- api_integration: Description of how the frontend communicates with the backend (fetch, SWR, etc.).

Return ONLY valid JSON with these exact keys. No markdown, no explanation.`;

/**
 * @param {{ prompt: string, architecture: object, api_endpoints: object[] }} input
 * @returns {Promise<{ output: object, tokenUsage: object }>}
 */
export async function execute(input) {
  const { prompt, architecture, api_endpoints } = input;

  const userPrompt = [
    `App idea:\n${prompt}`,
    `\nArchitecture:\n${JSON.stringify(architecture, null, 2)}`,
    api_endpoints
      ? `\nAPI endpoints:\n${JSON.stringify(api_endpoints, null, 2)}`
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
    logger.error({ err, text }, 'Frontend Dev agent: failed to parse LLM response');
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      output = JSON.parse(match[1].trim());
    } else {
      throw new Error('Frontend Dev agent returned invalid JSON');
    }
  }

  return { output, tokenUsage: usage };
}
