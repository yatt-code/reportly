import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation'; // Import helpers
import ReportPageContainer from '@/components/report/ReportPageContainer';
import DemoReportPage from '@/components/demo/DemoReportPage';
import { getReportById } from '@/app/report/actions/getReportById'; // Import server action
import logger from '@/lib/utils/logger'; // Optional logging
import NotAuthorized from '@/components/NotAuthorized'; // Import the component
import { cookies } from 'next/headers';

// Define props for the page component, including route parameters
interface ReportPageProps {
    params: {
        id: string; // The dynamic segment [id] from the URL
    };
    searchParams: {
        // Example: Allow controlling initial edit mode via query param like ?edit=true
        edit?: string;
    };
}

// Optional: Generate dynamic metadata based on the report ID
export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const reportId = params.id;

  // Check if in demo mode
  const cookieStore = cookies();
  const isDemoMode = cookieStore.get('reportly_demo_mode')?.value === 'true';

  // If in demo mode, use a generic title
  if (isDemoMode) {
    return {
      title: `View Report - Demo Mode`,
      description: `Demo report details`,
    };
  }

  // Otherwise, fetch report server-side to get title for metadata
  let reportTitle = `Report ${reportId.substring(0, 8)}...`; // Default/fallback
  try {
    const result = await getReportById(reportId);
    if (result.success && result.data) {
        reportTitle = result.data.title;
    }
    // Ignore errors here, just use default title if fetch fails
  } catch (e) { /* Ignore */ }

  return {
    title: `View Report - ${reportTitle}`,
    description: `Details for report ${reportId}`,
  };
}

/**
 * The page component for viewing/editing a single report.
 * It receives the report ID from the URL parameters.
 * Supports both regular and demo mode.
 */
const ReportPage: React.FC<ReportPageProps> = async ({ params, searchParams }) => {
    const reportId = params.id;
    const initialEditable = searchParams.edit === 'true';

    // Check if in demo mode
    const cookieStore = cookies();
    const isDemoMode = cookieStore.get('reportly_demo_mode')?.value === 'true';

    // If in demo mode, render the demo report page
    if (isDemoMode) {
        return <DemoReportPage reportId={reportId} />;
    }

    // --- Fetch Report Server-Side with Ownership Check ---
    const result = await getReportById(reportId);

    // Handle Forbidden access
    if (!result.success && result.forbidden) {
        logger.warn(`[ReportPage] Forbidden access attempt for report ${reportId}. Redirecting.`);
        return <NotAuthorized />;
    }

    // Handle Report Not Found
    if (!result.success && !result.forbidden) {
         logger.error(`[ReportPage] Error fetching report ${reportId}: ${result.error}`);
         notFound();
    }

    // If successful but data is null (shouldn't happen with current getReportById logic, but good practice)
    if (result.success && !result.data) {
         logger.warn(`[ReportPage] Report ${reportId} not found after successful fetch.`);
         notFound();
    }

    // We have the report data and user is authorized
    // Explicitly check success again to help TypeScript narrow the type
    if (!result.success) {
        // This should technically be unreachable due to previous checks, but satisfies TS
        logger.error(`[ReportPage] Unexpected state: fetch succeeded but success flag is false.`);
        notFound();
    }
    const reportData = result.data; // Now TS knows result.success is true

    return (
        <div>
            <ReportPageContainer
                reportId={reportId}
                initialEditable={initialEditable}
                initialData={reportData}
            />
        </div>
    );
};

export default ReportPage;

// Note on Data Fetching:
// Note: Data is now fetched server-side in this Page component.
// ReportPageContainer needs refactoring to accept initialData prop and remove internal useFetchReport hook.