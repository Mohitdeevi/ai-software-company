import env from '../config/env.js';
import { ExternalServiceError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Call the LLM API (Anthropic Messages API).
 *
 * @param {object} options
 * @param {string} options.systemPrompt - System-level instruction for the model.
 * @param {string} options.userPrompt   - The user message / task description.
 * @param {number} [options.maxTokens=4096]  - Maximum tokens in the response.
 * @param {number} [options.temperature=0]   - Sampling temperature.
 * @returns {Promise<{ text: string, usage: { input_tokens: number, output_tokens: number } }>}
 */
export async function callLLM({ systemPrompt, userPrompt, maxTokens, temperature }) {
  const url = `${env.llm.apiUrl}/messages`;

  const body = {
    model: env.llm.model,
    max_tokens: maxTokens || 4096,
    temperature: temperature || 0,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  };

  logger.debug({ model: body.model, maxTokens: body.max_tokens }, 'Calling LLM');

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': env.llm.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    logger.error({ err }, 'LLM network request failed');
    throw new ExternalServiceError('LLM', `Network error: ${err.message}`);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unable to read error body');
    logger.error({ status: response.status, errorBody }, 'LLM API returned error');
    throw new ExternalServiceError('LLM', `HTTP ${response.status}: ${errorBody}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    logger.error({ err }, 'Failed to parse LLM response JSON');
    throw new ExternalServiceError('LLM', 'Invalid JSON in response');
  }

  const text = data.content?.[0]?.text;
  if (!text) {
    logger.error({ data }, 'LLM response missing content text');
    throw new ExternalServiceError('LLM', 'Response missing content[0].text');
  }

  const usage = {
    input_tokens: data.usage?.input_tokens ?? 0,
    output_tokens: data.usage?.output_tokens ?? 0,
  };

  logger.debug({ usage }, 'LLM call completed');

  return { text, usage };
}
