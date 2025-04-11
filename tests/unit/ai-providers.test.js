/**
 * Unit tests for AI provider integration
 */

// Mock the dependencies
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'OpenAI mock response' } }],
              usage: {
                prompt_tokens: 10,
                completion_tokens: 20,
                total_tokens: 30
              }
            })
          }
        }
      };
    })
  };
});

jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({
    data: {
      choices: [{ message: { content: 'OpenRouter mock response' } }],
      usage: {
        prompt_tokens: 15,
        completion_tokens: 25,
        total_tokens: 40,
        cost: 0.0005
      }
    }
  })
}));

jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn()
}));

// Import the modules after mocking
const { callAI } = require('../../src/lib/ai/providers/aiClient');
const axios = require('axios');

describe('AI Provider Integration', () => {
  // Store original environment variables
  const originalEnv = { ...process.env };
  
  // Reset environment after each test
  afterEach(() => {
    process.env = { ...originalEnv };
  });
  
  describe('callAI function', () => {
    test('should call OpenAI when AI_PROVIDER is set to openai', async () => {
      // Set the environment variable
      process.env.AI_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-openai-key';
      
      // Call the function
      const result = await callAI({
        prompt: 'Test prompt',
        systemPrompt: 'Test system prompt',
        model: 'gpt-3.5-turbo'
      });
      
      // Check the result
      expect(result.content).toBe('OpenAI mock response');
      expect(result.meta.modelUsed).toBe('gpt-3.5-turbo');
      expect(result.meta.totalTokens).toBe(30);
    });
    
    test('should call OpenRouter when AI_PROVIDER is set to openrouter', async () => {
      // Set the environment variable
      process.env.AI_PROVIDER = 'openrouter';
      process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
      process.env.APP_URL = 'http://localhost:3000';
      
      // Call the function
      const result = await callAI({
        prompt: 'Test prompt',
        systemPrompt: 'Test system prompt',
        model: 'openai/gpt-3.5-turbo'
      });
      
      // Check the result
      expect(result.content).toBe('OpenRouter mock response');
      expect(result.meta.modelUsed).toBe('openai/gpt-3.5-turbo');
      expect(result.meta.totalTokens).toBe(40);
      expect(result.meta.cost).toBe(0.0005);
      
      // Check that axios was called with the correct parameters
      expect(axios.post).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          model: 'openai/gpt-3.5-turbo',
          messages: expect.any(Array),
          temperature: 0.7
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-openrouter-key',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Reportly AI Assistant'
          })
        })
      );
    });
    
    test('should default to OpenAI when AI_PROVIDER is not set', async () => {
      // Unset the environment variable
      delete process.env.AI_PROVIDER;
      process.env.OPENAI_API_KEY = 'test-openai-key';
      
      // Call the function
      const result = await callAI({
        prompt: 'Test prompt',
        systemPrompt: 'Test system prompt',
        model: 'gpt-3.5-turbo'
      });
      
      // Check the result
      expect(result.content).toBe('OpenAI mock response');
      expect(result.meta.modelUsed).toBe('gpt-3.5-turbo');
    });
    
    test('should throw an error for unsupported provider', async () => {
      // Set an invalid provider
      process.env.AI_PROVIDER = 'invalid-provider';
      
      // Call the function and expect it to throw
      await expect(callAI({
        prompt: 'Test prompt',
        systemPrompt: 'Test system prompt',
        model: 'gpt-3.5-turbo'
      })).rejects.toThrow('Unsupported AI provider: invalid-provider');
    });
  });
});
