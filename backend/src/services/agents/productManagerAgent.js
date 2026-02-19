import { callLLM } from '../llmClient.js';
import { logger } from '../../utils/logger.js';

const SYSTEM_PROMPT = `You are the Product Manager Agent. Create a complete Product Requirements Document (PRD) based on the strategic plan.

Define the following fields:
- features: An array of feature objects, each with:
  - id: A unique short identifier (e.g. "F1").
  - name: Feature name.
  - description: Detailed description.
  - priority: "must-have" | "should-have" | "nice-to-have".
  - user_stories: Array of user story strings.
  - acceptance_criteria: Array of acceptance criteria strings.
- edge_cases: An array of edge case descriptions.
- non_functional_requirements: An object covering performance, scalability, security, accessibility, etc.

Return ONLY valid JSON with these exact keys. No markdown, no explanation.`;

/**
 * @param {{ prompt: string, strategic_plan: object }} input
 * @returns {Promise<{ output: object, tokenUsage: object }>}
 */
export async function execute(input) {
  const { prompt, strategic_plan } = input;

  const userPrompt = [
    `App idea:\n${prompt}`,
    `\nStrategic plan:\n${JSON.stringify(strategic_plan, null, 2)}`,
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
    logger.error({ err, text }, 'Product Manager agent: failed to parse LLM response');
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      output = JSON.parse(match[1].trim());
    } else {
      throw new Error('Product Manager agent returned invalid JSON');
    }
  }

  return { output, tokenUsage: usage };
}
