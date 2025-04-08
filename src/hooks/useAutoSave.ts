import { useCallback, useEffect, useRef } from 'react';
import logger from '@/lib/utils/logger'; // Optional logging

/**
 * Custom hook to handle debounced saving of content.
 *
 * @param onSave - The function to call when saving is triggered.
 * @param delay - The debounce delay in milliseconds (default: 1000ms).
 */
export function useAutoSave(
  onSave: (content: any) => Promise<void> | void, // Allow sync or async save
  delay: number = 1000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestContentRef = useRef<any>(null);
  const latestOnSaveRef = useRef(onSave); // Ref to keep track of the latest onSave function

  // Update the ref if the onSave function instance changes
  useEffect(() => {
    latestOnSaveRef.current = onSave;
  }, [onSave]);

  // Function to trigger the save after debounce
  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (latestContentRef.current !== null) {
        logger.log('[useAutoSave] Debounce triggered. Saving content...');
        try {
          await latestOnSaveRef.current(latestContentRef.current);
          logger.log('[useAutoSave] Content saved successfully via debounce.');
          latestContentRef.current = null; // Reset content after successful save
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          logger.error('[useAutoSave] Error during debounced save:', error);
          // Handle error appropriately, maybe notify the user
        }
      }
    }, delay);
  }, [delay]);

  // Function to be called when content changes
  const triggerSave = useCallback((content: any) => {
    latestContentRef.current = content; // Store the latest content
    debouncedSave(); // Start or reset the debounce timer
  }, [debouncedSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        logger.log('[useAutoSave] Cleared pending save on unmount.');
        // Optionally trigger immediate save on unmount if needed
        // if (latestContentRef.current !== null) {
        //   latestOnSaveRef.current(latestContentRef.current);
        // }
      }
    };
  }, []);

  // Function for immediate save (e.g., on Ctrl+Enter or manual button)
  const saveImmediately = useCallback(async (content: any) => {
     if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Cancel any pending debounced save
        timeoutRef.current = null;
     }
     logger.log('[useAutoSave] Triggering immediate save...');
     try {
        await latestOnSaveRef.current(content);
        logger.log('[useAutoSave] Content saved successfully via immediate trigger.');
        latestContentRef.current = null; // Reset pending content
     } catch (err) {
       const error = err instanceof Error ? err : new Error(String(err));
       logger.error('[useAutoSave] Error during immediate save:', error);
       // Rethrow or handle as needed
       throw error; // Rethrow the original or wrapped error
     }
  }, []);


  return { triggerSave, saveImmediately };
}