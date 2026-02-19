import { callLLM } from '../llmClient.js';
import { logger } from '../../utils/logger.js';

const SYSTEM_PROMPT = `You are the Sales Agent of a software company. Given business context and a strategic plan, define the go-to-market strategy.

Define the following fields:
- ideal_customer_profile: A detailed description of the ideal customer.
- pricing_model: Pricing strategy with tiers if applicable.
- go_to_market_strategy: Step-by-step GTM plan.
- monetization_logic: How the product converts value into revenue.

Return ONLY valid JSON with these exact keys. No markdown, no explanation.`;

/**
 * @param {{ prompt: string, strategic_context: object }} input
 * @returns {Promise<{ output: object, tokenUsage: object }>}
 */
export async function execute(input) {
  const { prompt, strategic_context } = input;

  const userPrompt = [
    `App idea:\n${prompt}`,
    strategic_context
      ? `\nStrategic context:\n${JSON.stringify(strategic_context, null, 2)}`
      : '',
  ].join('\n');

  const { text, usage } = await callLLM({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
  });

  let output;
  try {
    output = JSON.parse(text);
  } catch (err) {
    logger.error({ err, text }, 'Sales agent: failed to parse LLM response');
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      output = JSON.parse(match[1].trim());
    } else {
      throw new Error('Sales agent returned invalid JSON');
    }
  }

  return { output, tokenUsage: usage };
}
