/**
 * Simple script to test AI provider integration
 *
 * Usage:
 * node scripts/test-ai-providers.js
 */

// Set up environment variables
process.env.AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key';
process.env.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'your-openrouter-api-key';
process.env.APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Import required modules
require('openai/shims/node');
const { OpenAI } = require('openai');
const axios = require('axios');

/**
 * Simple logger
 */
const logger = {
  log: (...args) => console.log(...args),
  error: (...args) => console.error(...args)
};

/**
 * Map OpenAI model names to OpenRouter model names
 */
function mapOpenAIToOpenRouter(model) {
  const modelMap = {
    'gpt-4': 'openai/gpt-4-turbo',
    'gpt-4-turbo': 'openai/gpt-4-turbo',
    'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
  };
  return modelMap[model] || model;
}

/**
 * Call AI with the specified provider
 */
async function callAI({
  prompt,
  systemPrompt = '',
  temperature = 0.7,
  model = 'gpt-3.5-turbo',
  maxTokens
}) {
  const provider = process.env.AI_PROVIDER;
  logger.log(`Starting AI call with provider: ${provider}`, { model });

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ];

  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(messages, temperature, model, maxTokens);
      case 'openrouter':
        return await callOpenRouter(messages, temperature, model, maxTokens);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    logger.error(`AI call failed`, error);
    throw new Error(`AI call failed: ${error.message}`);
  }
}

/**
 * Mock OpenAI API call
 */
async function callOpenAI(messages, temperature, model, maxTokens) {
  logger.log(`Calling OpenAI API (MOCK)`, { model, temperature });

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create a mock response
    const content = `This is a mock response from OpenAI using model ${model}. The system prompt was: "${messages[0].content}" and the user prompt was: "${messages[1].content}"`;

    const meta = {
      modelUsed: model,
      promptTokens: 20,
      completionTokens: 30,
      totalTokens: 50,
    };

    logger.log(`OpenAI call successful (MOCK)`, {
      contentLength: content.length,
      tokens: meta.totalTokens
    });

    return { content, meta };
  } catch (error) {
    logger.error(`OpenAI call failed`, error);
    throw error;
  }
}

/**
 * Mock OpenRouter API call
 */
async function callOpenRouter(messages, temperature, model, maxTokens) {
  logger.log(`Calling OpenRouter API (MOCK)`, { model, temperature });

  try {
    // Map OpenAI model names to OpenRouter model names if needed
    const mappedModel = mapOpenAIToOpenRouter(model);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create a mock response
    const content = `This is a mock response from OpenRouter using model ${mappedModel}. The system prompt was: "${messages[0].content}" and the user prompt was: "${messages[1].content}"`;

    const meta = {
      modelUsed: mappedModel,
      promptTokens: 25,
      completionTokens: 35,
      totalTokens: 60,
      cost: 0.0005
    };

    logger.log(`OpenRouter call successful (MOCK)`, {
      contentLength: content.length,
      tokens: meta.totalTokens,
      cost: meta.cost
    });

    return { content, meta };
  } catch (error) {
    logger.error(`OpenRouter call failed`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Test OpenAI
    process.env.AI_PROVIDER = 'openai';
    logger.log('Testing OpenAI integration...');
    const openaiResult = await callAI({
      prompt: 'Hello, world!',
      systemPrompt: 'You are a helpful assistant.',
      model: 'gpt-3.5-turbo',
      maxTokens: 50
    });
    logger.log('OpenAI Result:', openaiResult);

    // Test OpenRouter
    process.env.AI_PROVIDER = 'openrouter';
    logger.log('Testing OpenRouter integration...');
    const openrouterResult = await callAI({
      prompt: 'Hello, world!',
      systemPrompt: 'You are a helpful assistant.',
      model: 'gpt-3.5-turbo',
      maxTokens: 50
    });
    logger.log('OpenRouter Result:', openrouterResult);

    logger.log('All tests completed successfully!');
  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the main function
main();
