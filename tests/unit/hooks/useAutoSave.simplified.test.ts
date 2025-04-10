import { renderHook } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('useAutoSave Simplified', () => {
  // Test for Ctrl+Enter functionality
  it('should provide a saveImmediately function that bypasses debounce', async () => {
    // Create a mock save function
    const mockSave = jest.fn().mockResolvedValue(undefined);
    
    // Render the hook
    const { result } = renderHook(() => useAutoSave(mockSave, 2000));
    
    // Get the saveImmediately function
    const { saveImmediately } = result.current;
    
    // Call saveImmediately with some content
    await saveImmediately('immediate content');
    
    // Verify that the save function was called immediately with the correct content
    expect(mockSave).toHaveBeenCalledWith('immediate content');
    expect(mockSave).toHaveBeenCalledTimes(1);
    
    // Fast-forward time to ensure no additional calls
    jest.advanceTimersByTime(3000);
    
    // Verify that the save function was still only called once
    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});
