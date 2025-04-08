import React from 'react';
import Link from 'next/link';
import { MockReport } from '@/lib/mockData'; // Import the type
import { FileText, Tag } from 'lucide-react'; // Example icons

interface ReportListItemProps {
    report: MockReport;
}

/**
 * Displays a single report item in the list or grid view.
 */
const ReportListItem: React.FC<ReportListItemProps> = ({ report }) => {
    const formattedDate = report.createdAt.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const statusColor = report.status === 'Complete' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400';

    // Simple tag coloring based on common words (customize as needed)
    const getTagColor = (tag: string): string => {
        if (tag.includes('issue') || tag.includes('bug')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        if (tag.includes('feature') || tag.includes('update')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        if (tag.includes('task') || tag.includes('plan')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    return (
        <Link href={`/report/${report.id}`} className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                <div className="flex-grow">
                    <h4 className="font-semibold mb-1 truncate">{report.title}</h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                        <span className={statusColor}>{report.status}</span>
                        <span>&bull;</span>
                        <span>{formattedDate}</span>
                    </div>
                    {report.sentimentTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {report.sentimentTags.map((tag) => (
                                <span
                                    key={tag}
                                    className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 ${getTagColor(tag)}`}
                                >
                                    <Tag size={12} /> {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ReportListItem;