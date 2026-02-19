// Simple token estimation - ~4 chars per token for English text
// For production, integrate tiktoken or the LLM provider's tokenizer

export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function estimatePromptCost(promptTokens, completionTokens, model = 'claude-sonnet-4-6') {
  const pricing = {
    'claude-sonnet-4-6': { prompt: 3.0 / 1_000_000, completion: 15.0 / 1_000_000 },
    'claude-haiku-4-5': { prompt: 0.80 / 1_000_000, completion: 4.0 / 1_000_000 },
    'claude-opus-4-6': { prompt: 15.0 / 1_000_000, completion: 75.0 / 1_000_000 },
  };

  const rate = pricing[model] || pricing['claude-sonnet-4-6'];
  return (promptTokens * rate.prompt) + (completionTokens * rate.completion);
}

export const TOKEN_LIMITS = {
  MAX_PROMPT_TOKENS: 50000,
  MAX_PROJECT_TOKENS: 500000,
  WARNING_THRESHOLD: 0.8,
};
