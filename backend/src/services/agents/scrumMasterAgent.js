import { callLLM } from '../llmClient.js';
import { logger } from '../../utils/logger.js';

const SYSTEM_PROMPT = `You are the Scrum Master Agent. Given a PRD, create a sprint plan for development.

Define the following fields:
- sprints: An array of sprint objects, each with:
  - id: Sprint number (e.g. 1, 2, 3).
  - name: Sprint name / theme.
  - duration: Duration string (e.g. "2 weeks").
  - goal: One-sentence sprint goal.
  - tasks: Array of task strings assigned to this sprint.
- dependency_map: An object mapping task/feature IDs to their dependencies.
- timeline_estimate: A summary string of the overall estimated timeline.

Return ONLY valid JSON with these exact keys. No markdown, no explanation.`;

/**
 * @param {{ prompt: string, prd: object }} input
 * @returns {Promise<{ output: object, tokenUsage: object }>}
 */
export async function execute(input) {
  const { prompt, prd } = input;

  const userPrompt = [
    `App idea:\n${prompt}`,
    `\nProduct Requirements Document:\n${JSON.stringify(prd, null, 2)}`,
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
    logger.error({ err, text }, 'Scrum Master agent: failed to parse LLM response');
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      output = JSON.parse(match[1].trim());
    } else {
      throw new Error('Scrum Master agent returned invalid JSON');
    }
  }

  return { output, tokenUsage: usage };
}
