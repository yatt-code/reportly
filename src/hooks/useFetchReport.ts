import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/utils/logger';
// Import your actual report fetching action/function here eventually
// import { getReportById } from '@/app/report/actions/getReportById'; // Example: If you create a specific action

// Define a basic Report type (adjust based on your actual Report model)
interface ReportData {
    _id: string;
    title: string;
    content: string; // Assuming HTML content for the editor
    userId: string;
    groupId: string;
    createdAt: string; // Use string for simplicity, Date object is also fine
    updatedAt: string;
    // Add other fields like ai_summary, ai_tags if needed
}

interface UseFetchReportReturn {
    report: ReportData | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void; // Function to manually trigger a refetch
}

/**
 * Custom hook to fetch a single report by its ID.
 * Uses a MOCK fetch for now. Replace with actual data fetching logic.
 *
 * @param {string | null} reportId - The ID of the report to fetch. If null, does nothing.
 * @returns {UseFetchReportReturn} An object containing the report data, loading state, error state, and a refetch function.
 */
export function useFetchReport(reportId: string | null): UseFetchReportReturn {
    const [report, setReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchReport = useCallback(async () => {
        if (!reportId) {
            setReport(null);
            setIsLoading(false);
            setError(null);
            return; // Don't fetch if no ID is provided
        }

        const hookName = 'useFetchReport';
        logger.log(`[${hookName}] Attempting to fetch report...`, { reportId });
        setIsLoading(true);
        setError(null);
        setReport(null); // Clear previous report data

        try {
            // --- MOCK DATA FETCHING ---
            await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400)); // Simulate delay

            // Simulate finding a report
            if (reportId === 'error-test') {
                 throw new Error('Simulated fetch error');
            }
             if (reportId === 'not-found-test') {
                 setReport(null); // Simulate not found
                 logger.warn(`[${hookName}] Report not found (mock).`, { reportId });
            } else {
                // Generate mock report data
                const mockReport: ReportData = {
                    _id: reportId,
                    title: `Mock Report: ${reportId.substring(0, 8)}`,
                    content: `<p>This is the <strong>mock content</strong> for report ${reportId}.</p><p>It includes basic formatting.</p><pre><code class="language-javascript">console.log('Hello world!');</code></pre>`,
                    userId: 'mockUser123',
                    groupId: 'mockGroup456',
                    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                    updatedAt: new Date().toISOString(),
                };
                setReport(mockReport);
                logger.log(`[${hookName}] Mock report fetched successfully.`, { reportId });
            }
            // --- REPLACE WITH ACTUAL FETCH LOGIC ---
            // Example:
            // const result = await getReportById(reportId); // Assuming you have this server action
            // if (result.success && result.data) {
            //     setReport(result.data);
            //     logger.log(`[${hookName}] Report fetched successfully.`, { reportId });
            // } else {
            //     setError(new Error(result.error || 'Report not found.'));
            //     logger.error(`[${hookName}] Failed to fetch report.`, { reportId, error: result.error });
            // }
            // --------------------------------------

        } catch (err) {
            const fetchError = err instanceof Error ? err : new Error(String(err));
            logger.error(`[${hookName}] Error during fetch.`, { reportId, error: fetchError });
            setError(fetchError);
            setReport(null);
        } finally {
            setIsLoading(false);
            logger.log(`[${hookName}] Finished fetch attempt.`, { reportId });
        }
    }, [reportId]); // Dependency: refetch if reportId changes

    // Initial fetch on mount or when reportId changes
    useEffect(() => {
        fetchReport();
    }, [fetchReport]); // fetchReport is memoized by useCallback

    return {
        report,
        isLoading,
        error,
        refetch: fetchReport, // Expose the fetch function for manual refetching
    };
}