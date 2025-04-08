import React from 'react';
import ReportPageContainer from '@/components/report/ReportPageContainer';
import { Metadata } from 'next';

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

// Optional: Generate dynamic metadata based on the report ID (could fetch title server-side)
export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const reportId = params.id;
  // In a real app, you might fetch the report title here server-side
  // const reportTitle = await fetchReportTitle(reportId); // Example function
  const reportTitle = `Report ${reportId.substring(0, 8)}...`; // Placeholder title

  return {
    title: `View Report - ${reportTitle}`,
    description: `Details for report ${reportId}`,
  };
}

/**
 * The page component for viewing/editing a single report.
 * It receives the report ID from the URL parameters.
 */
const ReportPage: React.FC<ReportPageProps> = ({ params, searchParams }) => {
    const reportId = params.id;
    // Determine initial edit mode based on query parameter (e.g., ?edit=true)
    const initialEditable = searchParams.edit === 'true';

    return (
        <div>
            {/* Render the container, passing the report ID and initial edit state */}
            <ReportPageContainer
                reportId={reportId}
                initialEditable={initialEditable}
            />
        </div>
    );
};

export default ReportPage;

// Note on Data Fetching:
// This setup uses a client-side hook (`useFetchReport`) within ReportPageContainer.
// For improved performance (SSR/SSG), you could fetch the initial report data directly
// within this server component (`ReportPage`) and pass it down as a prop to
// ReportPageContainer, potentially eliminating the need for the initial client-side fetch.
// However, the client-side hook approach is simpler for handling loading/error states
// and refetching after saves within the client component itself. Choose based on project needs.