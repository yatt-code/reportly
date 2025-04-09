import React from 'react';

interface NotificationBadgeProps {
  count: number;
  className?: string; // Allow custom styling
}

/**
 * Displays a simple badge with a count, typically used for unread notifications.
 * Hides itself if the count is zero or less.
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className = '' }) => {
  if (count <= 0) {
    return null; // Don't render anything if count is zero or negative
  }

  // Basic styling using Tailwind classes - adjust as needed
  const baseStyle = "absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full";

  // Limit displayed count for visual clarity (e.g., show 9+ for > 9)
  const displayCount = count > 9 ? '9+' : count.toString();

  return (
    <span className={`${baseStyle} ${className}`} title={`${count} unread notifications`}>
      {displayCount}
    </span>
  );
};

export default NotificationBadge;