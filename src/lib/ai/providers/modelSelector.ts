import { getModelConfig, getModelsForProvider, ModelConfig } from './modelConfig';
import logger from '@/lib/utils/logger';

/**
 * The AI provider to use, defaulting to OpenAI if not specified
 */
const PROVIDER = process.env.AI_PROVIDER ?? "openai";

/**
 * Interface for model selection options
 */
interface ModelSelectionOptions {
  task?: 'summarization' | 'categorization' | 'generation' | 'enhancement' | 'general';
  quality?: 'high' | 'medium' | 'low';
  maxTokens?: number;
  costSensitive?: boolean;
}

/**
 * Default models for different tasks and quality levels
 */
const defaultModels: Record<string, Record<string, Record<string, string>>> = {
  openai: {
    summarization: {
      high: 'gpt-4',
      medium: 'gpt-3.5-turbo',
      low: 'gpt-3.5-turbo',
    },
    categorization: {
      high: 'gpt-4',
      medium: 'gpt-3.5-turbo',
      low: 'gpt-3.5-turbo',
    },
    generation: {
      high: 'gpt-4',
      medium: 'gpt-4',
      low: 'gpt-3.5-turbo',
    },
    enhancement: {
      high: 'gpt-4',
      medium: 'gpt-3.5-turbo',
      low: 'gpt-3.5-turbo',
    },
    general: {
      high: 'gpt-4',
      medium: 'gpt-3.5-turbo',
      low: 'gpt-3.5-turbo',
    },
  },
  openrouter: {
    summarization: {
      high: 'anthropic/claude-3-opus',
      medium: 'anthropic/claude-3-sonnet',
      low: 'openai/gpt-3.5-turbo',
    },
    categorization: {
      high: 'anthropic/claude-3-opus',
      medium: 'openai/gpt-3.5-turbo',
      low: 'google/gemini-pro',
    },
    generation: {
      high: 'anthropic/claude-3-opus',
      medium: 'openai/gpt-4-turbo',
      low: 'anthropic/claude-3-sonnet',
    },
    enhancement: {
      high: 'anthropic/claude-3-opus',
      medium: 'anthropic/claude-3-sonnet',
      low: 'openai/gpt-3.5-turbo',
    },
    general: {
      high: 'anthropic/claude-3-opus',
      medium: 'openai/gpt-4-turbo',
      low: 'openai/gpt-3.5-turbo',
    },
  },
};

/**
 * Select the best model for a given task and quality level
 * 
 * @param options - Options for model selection
 * @returns The selected model name
 */
export function selectModel(options: ModelSelectionOptions = {}): string {
  const functionName = 'selectModel';
  
  const provider = PROVIDER;
  const task = options.task || 'general';
  const quality = options.quality || 'medium';
  const costSensitive = options.costSensitive || false;
  
  logger.log(`[${functionName}] Selecting model for task: ${task}, quality: ${quality}`, { 
    provider, 
    costSensitive 
  });

  try {
    // Get the default model for this task and quality
    const defaultModel = defaultModels[provider]?.[task]?.[quality];
    
    if (!defaultModel) {
      logger.warn(`[${functionName}] No default model found for provider: ${provider}, task: ${task}, quality: ${quality}`);
      // Fall back to a safe default
      return provider === 'openai' ? 'gpt-3.5-turbo' : 'openai/gpt-3.5-turbo';
    }
    
    // If cost-sensitive, try to find a cheaper model that can handle the task
    if (costSensitive) {
      const models = getModelsForProvider(provider);
      const modelConfig = getModelConfig(defaultModel, provider);
      
      if (modelConfig && models) {
        // Find models with lower cost
        const cheaperModels = Object.values(models).filter(m => 
          m.costPer1KTokens && 
          modelConfig.costPer1KTokens &&
          m.costPer1KTokens.output < modelConfig.costPer1KTokens.output &&
          m.maxTokens >= (options.maxTokens || 1000)
        );
        
        if (cheaperModels.length > 0) {
          // Sort by cost (ascending)
          cheaperModels.sort((a, b) => 
            (a.costPer1KTokens?.output || 0) - (b.costPer1KTokens?.output || 0)
          );
          
          // Return the cheapest model
          logger.log(`[${functionName}] Selected cheaper alternative model: ${cheaperModels[0].name}`);
          return cheaperModels[0].name;
        }
      }
    }
    
    logger.log(`[${functionName}] Selected model: ${defaultModel}`);
    return defaultModel;
  } catch (error) {
    logger.error(`[${functionName}] Error selecting model`, error);
    // Fall back to a safe default
    return provider === 'openai' ? 'gpt-3.5-turbo' : 'openai/gpt-3.5-turbo';
  }
}

/**
 * Get information about a selected model
 * 
 * @param modelName - The name of the model
 * @returns The model configuration or undefined if not found
 */
export function getModelInfo(modelName: string): ModelConfig | undefined {
  const provider = PROVIDER;
  return getModelConfig(modelName, provider);
}
