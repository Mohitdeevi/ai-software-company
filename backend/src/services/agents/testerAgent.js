import { callLLM } from '../llmClient.js';
import { logger } from '../../utils/logger.js';

const SYSTEM_PROMPT = `You are the QA/Test Agent. Generate a comprehensive testing strategy based on the architecture and implementation plans.

Frameworks: Jest, Supertest, Playwright.

Define the following fields:
- unit_tests: Array of test file objects, each with:
  - file: The test file path (e.g. "tests/unit/userService.test.js").
  - tests: Array of test case description strings.
- integration_tests: Array of integration test objects with file and tests.
- e2e_tests: Array of end-to-end test objects with file and tests.
- edge_case_scenarios: Array of edge case descriptions that must be covered.

Return ONLY valid JSON with these exact keys. No markdown, no explanation.`;

/**
 * @param {{ prompt: string, architecture: object, backend_plan: object, frontend_plan: object }} input
 * @returns {Promise<{ output: object, tokenUsage: object }>}
 */
export async function execute(input) {
  const { prompt, architecture, backend_plan, frontend_plan } = input;

  const userPrompt = [
    `App idea:\n${prompt}`,
    `\nArchitecture:\n${JSON.stringify(architecture, null, 2)}`,
    backend_plan
      ? `\nBackend plan:\n${JSON.stringify(backend_plan, null, 2)}`
      : '',
    frontend_plan
      ? `\nFrontend plan:\n${JSON.stringify(frontend_plan, null, 2)}`
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
    logger.error({ err, text }, 'Tester agent: failed to parse LLM response');
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      output = JSON.parse(match[1].trim());
    } else {
      throw new Error('Tester agent returned invalid JSON');
    }
  }

  return { output, tokenUsage: usage };
}
