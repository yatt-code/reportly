import { renderHook, act } from '@testing-library/react';
import { useAiAssist } from '@/hooks/useAiAssist';
import { suggestImprovements } from '@/lib/ai/active/aiAssistInEditor';

// Mock dependencies
jest.mock('@/lib/ai/active/aiAssistInEditor', () => ({
  suggestImprovements: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('useAiAssist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty suggestions and no loading/error state', () => {
    // Render the hook
    const { result } = renderHook(() => useAiAssist());
    
    // Verify initial state
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch suggestions and update state accordingly', async () => {
    // Mock successful response
    const mockSuggestions = [
      { suggestion: 'Suggestion 1', confidence: 0.8 },
      { suggestion: 'Suggestion 2', confidence: 0.7 },
    ];
    (suggestImprovements as jest.Mock).mockResolvedValueOnce(mockSuggestions);
    
    // Render the hook
    const { result } = renderHook(() => useAiAssist());
    
    // Initial state check
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    
    // Call getSuggestions
    await act(async () => {
      await result.current.getSuggestions('Test content');
    });
    
    // Verify loading state was set during the call
    expect(suggestImprovements).toHaveBeenCalledWith('Test content');
    
    // Verify final state
    expect(result.current.suggestions).toEqual(mockSuggestions);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors when fetching suggestions', async () => {
    // Mock error response
    const mockError = new Error('Failed to fetch suggestions');
    (suggestImprovements as jest.Mock).mockRejectedValueOnce(mockError);
    
    // Render the hook
    const { result } = renderHook(() => useAiAssist());
    
    // Call getSuggestions
    await act(async () => {
      await result.current.getSuggestions('Test content');
    });
    
    // Verify error state
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(mockError);
  });

  it('should clear previous suggestions when fetching new ones', async () => {
    // Mock initial successful response
    const initialSuggestions = [{ suggestion: 'Initial suggestion', confidence: 0.8 }];
    (suggestImprovements as jest.Mock).mockResolvedValueOnce(initialSuggestions);
    
    // Render the hook
    const { result } = renderHook(() => useAiAssist());
    
    // First call to getSuggestions
    await act(async () => {
      await result.current.getSuggestions('First content');
    });
    
    // Verify initial suggestions
    expect(result.current.suggestions).toEqual(initialSuggestions);
    
    // Mock second successful response
    const newSuggestions = [{ suggestion: 'New suggestion', confidence: 0.9 }];
    (suggestImprovements as jest.Mock).mockResolvedValueOnce(newSuggestions);
    
    // Second call to getSuggestions
    await act(async () => {
      await result.current.getSuggestions('Second content');
    });
    
    // Verify new suggestions replaced the old ones
    expect(result.current.suggestions).toEqual(newSuggestions);
    expect(result.current.suggestions).not.toEqual(initialSuggestions);
  });

  it('should clear error state when fetching new suggestions', async () => {
    // Mock initial error response
    const mockError = new Error('Failed to fetch suggestions');
    (suggestImprovements as jest.Mock).mockRejectedValueOnce(mockError);
    
    // Render the hook
    const { result } = renderHook(() => useAiAssist());
    
    // First call to getSuggestions (will fail)
    await act(async () => {
      await result.current.getSuggestions('Error content');
    });
    
    // Verify error state
    expect(result.current.error).toEqual(mockError);
    
    // Mock successful response for second call
    const newSuggestions = [{ suggestion: 'New suggestion', confidence: 0.9 }];
    (suggestImprovements as jest.Mock).mockResolvedValueOnce(newSuggestions);
    
    // Second call to getSuggestions (will succeed)
    await act(async () => {
      await result.current.getSuggestions('Success content');
    });
    
    // Verify error was cleared
    expect(result.current.error).toBeNull();
    expect(result.current.suggestions).toEqual(newSuggestions);
  });
});
