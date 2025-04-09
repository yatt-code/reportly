import logger from '@/lib/utils/logger'; // Optional logging

/**
 * Checks if the provided userId matches the userId on a report object.
 * Throws an error if ownership does not match.
 *
 * @param report - The report object containing a userId field.
 * @param userId - The ID of the user attempting the action.
 * @param actionContext - Optional string describing the action for logging (e.g., 'delete', 'update').
 * @throws {Error} If userId does not match report.userId.
 */
export function assertOwnership(
    report: { userId: string; _id?: string | any; id?: string | any }, // Expect report object with userId
    userId: string,
    actionContext: string = 'access'
): void {
    if (!report || typeof report.userId !== 'string') {
        // This case indicates a problem with the data passed to the function
        logger.error('[assertOwnership] Invalid report object provided for ownership check.', { report });
        throw new Error('Internal Server Error: Invalid data for ownership check.');
    }

    if (report.userId !== userId) {
        const reportId = report._id || report.id || 'unknown';
        logger.error(`[assertOwnership] Authorization failed: User ${userId} attempted to ${actionContext} report ${reportId} owned by ${report.userId}.`);
        throw new Error('Forbidden: You do not own this report.'); // Throw a specific error
    }

    // If we reach here, ownership is confirmed
    // logger.log(`[assertOwnership] Ownership verified for user ${userId} on report ${report._id || report.id}.`);
}