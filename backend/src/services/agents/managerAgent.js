import { callLLM } from '../llmClient.js';
import { logger } from '../../utils/logger.js';

const SYSTEM_PROMPT = `You are the Manager Agent of a software company. Given a user's app idea, analyze it and produce a strategic definition.

Define the following fields:
- business_objective: A clear one-paragraph business objective.
- target_users: An array of target user personas (strings).
- constraints: An array of technical or business constraints.
- revenue_model: A description of how the product will generate revenue.
- non_goals: An array of things explicitly out of scope.

Return ONLY valid JSON with these exact keys. No markdown, no explanation.`;

/**
 * @param {{ prompt: string }} input
 * @returns {Promise<{ output: object, tokenUsage: object }>}
 */
export async function execute(input) {
  const { prompt } = input;

  const userPrompt = `App idea:\n${prompt}`;

  const { text, usage } = await callLLM({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
  });

  let output;
  try {
    output = JSON.parse(text);
  } catch (err) {
    logger.error({ err, text }, 'Manager agent: failed to parse LLM response');
    // Attempt to extract JSON from markdown code fences
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      output = JSON.parse(match[1].trim());
    } else {
      throw new Error('Manager agent returned invalid JSON');
    }
  }

  return { output, tokenUsage: usage };
}
