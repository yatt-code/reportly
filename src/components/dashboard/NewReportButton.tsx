'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveReport } from '@/app/report/actions/saveReport'; // Use saveReport for creation
import logger from '@/lib/utils/logger';
import { showAchievementToasts } from '@/components/achievements/AchievementToast';

/**
 * Floating Action Button to create a new report and redirect to the editor.
 */
const NewReportButton: React.FC = () => {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    // const [isPending, startTransition] = useTransition(); // Alternative loading state management

    const handleNewReport = async () => {
        setIsCreating(true);
        logger.log('[NewReportButton] Attempting to create new report...');
        const toastId = toast.loading('Creating new report...');

        try {
            // --- Get User/Group Info (Replace with actual auth logic) ---
            // In a real app, get this from session or context
            const mockUserId = 'user_placeholder_123';
            const mockGroupId = 'group_placeholder_456';
            // ----------------------------------------------------------

            const result = await saveReport({
                // No reportId signifies creation
                title: 'Untitled Report', // Default title
                content: '', // Start with empty content
                userId: mockUserId,
                groupId: mockGroupId,
            });

            if (result.success && result.report?._id) {
                const newReportId = result.report._id;
                logger.log('[NewReportButton] New report created successfully.', { newReportId });
                toast.success('New report created!', { id: toastId });

                // Check if any achievements were unlocked
                if (result.unlocked && result.unlocked.length > 0) {
                    logger.log('[NewReportButton] Achievements unlocked:', { achievements: result.unlocked });
                    // Show achievement toasts
                    showAchievementToasts(result.unlocked);
                }

                // Redirect to the editor page for the new report, forcing edit mode
                router.push(`/report/${newReportId}?edit=true`);
            } else if (!result.success) { // Check failure case before accessing error
                throw new Error(result.error || 'Failed to create report.');
            } else {
                 // Should not happen if success is true but report._id is missing
                 throw new Error('Report created but ID missing in response.');
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error('[NewReportButton] Error creating new report.', error);
            toast.error(`Error: ${error.message}`, { id: toastId });
            setIsCreating(false); // Ensure loading state is reset on error
        }
        // No need to set isCreating to false on success because of navigation
    };

    return (
        <button
            onClick={handleNewReport}
            disabled={isCreating}
            className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 z-20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            title="Create New Report"
        >
            {isCreating ? (
                <Loader2 size={24} className="animate-spin" />
            ) : (
                <Plus size={24} />
            )}
        </button>
    );
};

export default NewReportButton;