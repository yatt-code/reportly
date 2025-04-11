/**
 * Integration tests for AI provider integration
 * 
 * These tests verify that both OpenAI and OpenRouter integrations work correctly.
 * 
 * To run these tests:
 * 1. Set up .env.test with valid API keys for both providers
 * 2. Run: npm test -- tests/integration/ai-providers.test.js
 */

import { callAI } from '../../src/lib/ai/providers/aiClient';
import { selectModel } from '../../src/lib/ai/providers/modelSelector';
import { generateSummary } from '../../src/lib/ai/passive/generateSummary';
import { categorizeReport } from '../../src/lib/ai/passive/categorizeReport';
import { enhanceText } from '../../src/lib/ai/active/enhanceText';
import { fetchSuggestions } from '../../src/lib/ai/active/fetchSuggestions';

// Sample content for testing
const sampleContent = `
Reportly Project Update - April 2023

The team has made significant progress on the Reportly project this month. 
We've completed the authentication system, implemented the report editor, 
and started work on the AI integration layer.

Key achievements:
- Completed user authentication with role-based access control
- Implemented rich text editor with basic formatting options
- Created database schema for reports and user data
- Started integration with OpenAI for report summarization

Next steps:
- Complete AI integration for report summarization and categorization
- Implement comment system with threading
- Add notification system for mentions and updates
- Begin work on the dashboard UI

The project is currently on schedule and within budget. We expect to have a 
working prototype ready for internal testing by the end of next month.
`;

// Helper function to set the AI provider for testing
function setProvider(provider) {
  process.env.AI_PROVIDER = provider;
}

describe('AI Provider Integration Tests', () => {
  // Store original environment variables
  const originalEnv = { ...process.env };
  
  // Set up test environment
  beforeAll(() => {
    // Ensure we have API keys for both providers
    expect(process.env.OPENAI_API_KEY).toBeTruthy();
    expect(process.env.OPENROUTER_API_KEY).toBeTruthy();
  });
  
  // Reset environment after each test
  afterEach(() => {
    process.env = { ...originalEnv };
  });
  
  describe('Basic AI Client Tests', () => {
    test('should call OpenAI API successfully', async () => {
      setProvider('openai');
      
      const response = await callAI({
        prompt: 'Hello, world!',
        systemPrompt: 'You are a helpful assistant.',
        model: 'gpt-3.5-turbo',
      });
      
      expect(response.content).toBeTruthy();
      expect(response.meta.modelUsed).toBe('gpt-3.5-turbo');
    }, 10000); // Increase timeout for API call
    
    test('should call OpenRouter API successfully', async () => {
      setProvider('openrouter');
      
      const response = await callAI({
        prompt: 'Hello, world!',
        systemPrompt: 'You are a helpful assistant.',
        model: 'openai/gpt-3.5-turbo',
      });
      
      expect(response.content).toBeTruthy();
      expect(response.meta.modelUsed).toBe('openai/gpt-3.5-turbo');
    }, 10000); // Increase timeout for API call
  });
  
  describe('Model Selection Tests', () => {
    test('should select appropriate model for OpenAI', () => {
      setProvider('openai');
      
      const model = selectModel({
        task: 'summarization',
        quality: 'medium',
      });
      
      expect(model).toBeTruthy();
    });
    
    test('should select appropriate model for OpenRouter', () => {
      setProvider('openrouter');
      
      const model = selectModel({
        task: 'summarization',
        quality: 'medium',
      });
      
      expect(model).toBeTruthy();
    });
  });
  
  describe('AI Function Tests', () => {
    test('should generate summary with OpenAI', async () => {
      setProvider('openai');
      
      const result = await generateSummary(sampleContent);
      
      expect(result.summary).toBeTruthy();
      expect(result.meta.modelUsed).toBeTruthy();
    }, 15000);
    
    test('should generate summary with OpenRouter', async () => {
      setProvider('openrouter');
      
      const result = await generateSummary(sampleContent);
      
      expect(result.summary).toBeTruthy();
      expect(result.meta.modelUsed).toBeTruthy();
    }, 15000);
    
    test('should categorize report with OpenAI', async () => {
      setProvider('openai');
      
      const result = await categorizeReport(sampleContent);
      
      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.meta.modelUsed).toBeTruthy();
    }, 15000);
    
    test('should categorize report with OpenRouter', async () => {
      setProvider('openrouter');
      
      const result = await categorizeReport(sampleContent);
      
      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.meta.modelUsed).toBeTruthy();
    }, 15000);
    
    test('should enhance text with OpenAI', async () => {
      setProvider('openai');
      
      const result = await enhanceText('This is a test sentence with some gramatical errors.');
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }, 15000);
    
    test('should enhance text with OpenRouter', async () => {
      setProvider('openrouter');
      
      const result = await enhanceText('This is a test sentence with some gramatical errors.');
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }, 15000);
    
    test('should fetch suggestions with OpenAI', async () => {
      setProvider('openai');
      
      const result = await fetchSuggestions('test-report-id', sampleContent);
      
      expect(Array.isArray(result)).toBe(true);
    }, 15000);
    
    test('should fetch suggestions with OpenRouter', async () => {
      setProvider('openrouter');
      
      const result = await fetchSuggestions('test-report-id', sampleContent);
      
      expect(Array.isArray(result)).toBe(true);
    }, 15000);
  });
  
  describe('Error Handling Tests', () => {
    test('should handle invalid API key for OpenAI', async () => {
      setProvider('openai');
      process.env.OPENAI_API_KEY = 'invalid-key';
      
      await expect(callAI({
        prompt: 'Hello, world!',
        model: 'gpt-3.5-turbo',
      })).rejects.toThrow();
    });
    
    test('should handle invalid API key for OpenRouter', async () => {
      setProvider('openrouter');
      process.env.OPENROUTER_API_KEY = 'invalid-key';
      
      await expect(callAI({
        prompt: 'Hello, world!',
        model: 'openai/gpt-3.5-turbo',
      })).rejects.toThrow();
    });
  });
});
