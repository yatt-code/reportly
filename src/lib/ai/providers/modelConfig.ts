/**
 * Configuration for AI models across different providers
 */

/**
 * Interface for model configuration
 */
export interface ModelConfig {
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
  costPer1KTokens?: {
    input: number;
    output: number;
  };
}

/**
 * OpenAI model configurations
 */
export const openAIModels: Record<string, ModelConfig> = {
  "gpt-4": {
    name: "gpt-4",
    provider: "openai",
    description: "Most capable GPT-4 model for complex tasks",
    maxTokens: 8192,
    costPer1KTokens: {
      input: 0.03,
      output: 0.06,
    },
  },
  "gpt-4-turbo": {
    name: "gpt-4-turbo",
    provider: "openai",
    description: "Improved version of GPT-4 with better performance",
    maxTokens: 128000,
    costPer1KTokens: {
      input: 0.01,
      output: 0.03,
    },
  },
  "gpt-3.5-turbo": {
    name: "gpt-3.5-turbo",
    provider: "openai",
    description: "Most capable GPT-3.5 model optimized for chat",
    maxTokens: 16385,
    costPer1KTokens: {
      input: 0.0015,
      output: 0.002,
    },
  },
  "gpt-4o-mini": {
    name: "gpt-4o-mini",
    provider: "openai",
    description: "Smaller, faster version of GPT-4o",
    maxTokens: 128000,
    costPer1KTokens: {
      input: 0.0015,
      output: 0.002,
    },
  },
  "o3-mini": {
    name: "o3-mini",
    provider: "openai",
    description: "OpenAI's o3-mini model",
    maxTokens: 128000,
    costPer1KTokens: {
      input: 0.0015,
      output: 0.002,
    },
  }
};

/**
 * OpenRouter model configurations
 * Note: These are mapped from OpenAI models to their OpenRouter equivalents
 */
export const openRouterModels: Record<string, ModelConfig> = {
  "openai/gpt-4-turbo": {
    name: "openai/gpt-4-turbo",
    provider: "openrouter",
    description: "OpenAI's GPT-4 Turbo via OpenRouter",
    maxTokens: 128000,
    costPer1KTokens: {
      input: 0.01,
      output: 0.03,
    },
  },
  "openai/gpt-3.5-turbo": {
    name: "openai/gpt-3.5-turbo",
    provider: "openrouter",
    description: "OpenAI's GPT-3.5 Turbo via OpenRouter",
    maxTokens: 16385,
    costPer1KTokens: {
      input: 0.0015,
      output: 0.002,
    },
  },
  "openai/gpt-4o-mini": {
    name: "openai/gpt-4o-mini",
    provider: "openrouter",
    description: "OpenAI's GPT-4o-mini via OpenRouter",
    maxTokens: 128000,
    costPer1KTokens: {
      input: 0.0015,
      output: 0.002,
    },
  },
  "openai/o3-mini": {
    name: "openai/o3-mini",
    provider: "openrouter",
    description: "OpenAI's o3-mini via OpenRouter",
    maxTokens: 128000,
    costPer1KTokens: {
      input: 0.0015,
      output: 0.002,
    },
  },
  "anthropic/claude-3-opus": {
    name: "anthropic/claude-3-opus",
    provider: "openrouter",
    description: "Anthropic's most powerful model, Claude 3 Opus",
    maxTokens: 200000,
    costPer1KTokens: {
      input: 0.015,
      output: 0.075,
    },
  },
  "anthropic/claude-3-sonnet": {
    name: "anthropic/claude-3-sonnet",
    provider: "openrouter",
    description: "Anthropic's balanced Claude 3 Sonnet model",
    maxTokens: 200000,
    costPer1KTokens: {
      input: 0.003,
      output: 0.015,
    },
  },
  "google/gemini-pro": {
    name: "google/gemini-pro",
    provider: "openrouter",
    description: "Google's Gemini Pro model",
    maxTokens: 32768,
    costPer1KTokens: {
      input: 0.00125,
      output: 0.00375,
    },
  },
  "google/gemini-2.0-flash-001": {
    name: "google/gemini-2.0-flash-001",
    provider: "openrouter",
    description: "Google's Gemini 2.0 Flash model",
    maxTokens: 128000,
    costPer1KTokens: {
      input: 0.0015,
      output: 0.002,
    },
  }
};

/**
 * Map from OpenAI model names to OpenRouter model names
 */
export const openAIToOpenRouterModelMap: Record<string, string> = {
  "gpt-4": "openai/gpt-4-turbo",
  "gpt-4-turbo": "openai/gpt-4-turbo",
  "gpt-3.5-turbo": "openai/gpt-3.5-turbo",
  "gpt-4o-mini": "openai/gpt-4o-mini",
  "o3-mini": "openai/o3-mini"
};

/**
 * Get all available models for a specific provider
 * 
 * @param provider - The provider to get models for
 * @returns Record of model configurations
 */
export function getModelsForProvider(provider: string): Record<string, ModelConfig> {
  switch (provider) {
    case "openai":
      return openAIModels;
    case "openrouter":
      return openRouterModels;
    default:
      return {};
  }
}

/**
 * Get a model configuration by name and provider
 * 
 * @param modelName - The name of the model
 * @param provider - The provider of the model
 * @returns The model configuration or undefined if not found
 */
export function getModelConfig(modelName: string, provider: string): ModelConfig | undefined {
  const models = getModelsForProvider(provider);
  return models[modelName];
}

/**
 * Map an OpenAI model name to its OpenRouter equivalent
 * 
 * @param openAIModelName - The OpenAI model name
 * @returns The OpenRouter model name or the original if no mapping exists
 */
export function mapOpenAIToOpenRouter(openAIModelName: string): string {
  return openAIToOpenRouterModelMap[openAIModelName] || openAIModelName;
}
