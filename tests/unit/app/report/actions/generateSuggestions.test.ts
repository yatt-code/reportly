import { generateSuggestions } from '@/app/report/actions/generateSuggestions';
import logger from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('generateSuggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate suggestions for valid content', async () => {
    // Arrange
    const content = 'This is a test report with some content to analyze.';
    
    // Act
    const result = await generateSuggestions(content);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.suggestions).toBeDefined();
    expect(result.suggestions?.length).toBeGreaterThan(0);
    expect(result.error).toBeUndefined();
    
    // Verify each suggestion has the required properties
    result.suggestions?.forEach(suggestion => {
      expect(suggestion).toHaveProperty('id');
      expect(suggestion).toHaveProperty('type');
      expect(suggestion).toHaveProperty('title');
      expect(suggestion).toHaveProperty('suggestion');
      expect(suggestion).toHaveProperty('confidence');
    });
    
    // Verify logging
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining('generateSuggestions (action)'),
      expect.objectContaining({ contentLength: content.length })
    );
  });

  it('should include specific suggestions when content contains certain words', async () => {
    // Arrange
    const content = 'This report contains a mistake that should be fixed.';
    
    // Act
    const result = await generateSuggestions(content);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.suggestions).toBeDefined();
    
    // Verify that a grammar suggestion is included for the word "mistake"
    const grammarSuggestion = result.suggestions?.find(s => s.type === 'grammar');
    expect(grammarSuggestion).toBeDefined();
    expect(grammarSuggestion?.originalText).toBe('mistake');
  });

  it('should return an error for insufficient content', async () => {
    // Arrange - content too short
    const shortContent = 'Hi';
    
    // Act
    const result = await generateSuggestions(shortContent);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Insufficient content for suggestions.');
    expect(result.suggestions).toBeUndefined();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Insufficient content provided')
    );
  });

  it('should return an error for null content', async () => {
    // Act
    // @ts-ignore - Intentionally passing null for testing
    const result = await generateSuggestions(null);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Insufficient content for suggestions.');
    expect(result.suggestions).toBeUndefined();
  });

  it('should return an error for non-string content', async () => {
    // Act
    // @ts-ignore - Intentionally passing non-string for testing
    const result = await generateSuggestions(123);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Insufficient content for suggestions.');
    expect(result.suggestions).toBeUndefined();
  });

  // This test simulates an error in the suggestion generation process
  it('should handle errors during suggestion generation', async () => {
    // Arrange - mock implementation to throw an error
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = jest.fn().mockImplementationOnce(callback => {
      throw new Error('Mock error during suggestion generation');
    });
    
    try {
      // Act
      const content = 'This is valid content that should trigger an error.';
      const result = await generateSuggestions(content);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to generate suggestions');
      expect(result.suggestions).toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    } finally {
      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
    }
  });
});
