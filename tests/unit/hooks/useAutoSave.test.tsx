import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';

// Mock the logger
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('useAutoSave', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call onSave after the specified delay', async () => {
    // Create a mock save function
    const mockSave = jest.fn().mockResolvedValue(undefined);
    
    // Render the hook
    const { result } = renderHook(() => useAutoSave(mockSave, 2000));
    
    // Trigger a save with some content
    act(() => {
      result.current.triggerSave('test content');
    });
    
    // Verify that the save function hasn't been called yet
    expect(mockSave).not.toHaveBeenCalled();
    
    // Fast-forward time by the delay amount
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Verify that the save function was called with the correct content
    expect(mockSave).toHaveBeenCalledWith('test content');
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('should debounce multiple calls within the delay period', async () => {
    // Create a mock save function
    const mockSave = jest.fn().mockResolvedValue(undefined);
    
    // Render the hook
    const { result } = renderHook(() => useAutoSave(mockSave, 2000));
    
    // Trigger multiple saves with different content
    act(() => {
      result.current.triggerSave('content 1');
    });
    
    // Fast-forward time by half the delay
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Trigger another save
    act(() => {
      result.current.triggerSave('content 2');
    });
    
    // Fast-forward time by half the delay again
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Verify that the save function hasn't been called yet
    expect(mockSave).not.toHaveBeenCalled();
    
    // Fast-forward time by the remaining delay
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Verify that the save function was called only once with the latest content
    expect(mockSave).toHaveBeenCalledWith('content 2');
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('should allow immediate saving', async () => {
    // Create a mock save function
    const mockSave = jest.fn().mockResolvedValue(undefined);
    
    // Render the hook
    const { result } = renderHook(() => useAutoSave(mockSave, 2000));
    
    // Trigger a save with some content
    act(() => {
      result.current.triggerSave('debounced content');
    });
    
    // Trigger an immediate save with different content
    await act(async () => {
      await result.current.saveImmediately('immediate content');
    });
    
    // Verify that the immediate save function was called
    expect(mockSave).toHaveBeenCalledWith('immediate content');
    expect(mockSave).toHaveBeenCalledTimes(1);
    
    // Fast-forward time by the delay amount
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Verify that the debounced save was not called (it should have been cancelled)
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('should handle errors in the save function', async () => {
    // Create a mock save function that throws an error
    const mockError = new Error('Save failed');
    const mockSave = jest.fn().mockRejectedValue(mockError);
    
    // Render the hook
    const { result } = renderHook(() => useAutoSave(mockSave, 2000));
    
    // Trigger a save with some content
    act(() => {
      result.current.triggerSave('test content');
    });
    
    // Fast-forward time by the delay amount
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Verify that the save function was called
    expect(mockSave).toHaveBeenCalledWith('test content');
    
    // Verify that the error was logged (if we were checking logger.error)
    // expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error during debounced save:'), mockError);
  });

  it('should clean up timeout on unmount', () => {
    // Create a mock save function
    const mockSave = jest.fn();
    
    // Render the hook
    const { result, unmount } = renderHook(() => useAutoSave(mockSave, 2000));
    
    // Trigger a save with some content
    act(() => {
      result.current.triggerSave('test content');
    });
    
    // Unmount the component
    unmount();
    
    // Fast-forward time by the delay amount
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Verify that the save function was not called
    expect(mockSave).not.toHaveBeenCalled();
  });
});
