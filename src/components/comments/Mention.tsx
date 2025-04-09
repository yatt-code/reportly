import React from 'react';
import Link from 'next/link'; // Optional for linking

interface MentionProps {
    username: string;
    // Optional: Add userId if needed for linking
    // userId?: string;
}

/**
 * Renders an @username mention with distinct styling.
 * Optionally links to a user profile page if implemented.
 */
const Mention: React.FC<MentionProps> = ({ username }) => {
    // Basic styling - adjust with Tailwind classes as needed
    const mentionStyle = "font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer px-0.5 bg-blue-100/50 dark:bg-blue-900/30 rounded-sm";

    // Optional: Link to profile page if it exists (e.g., /profile/username)
    // return (
    //     <Link href={`/profile/${username}`} className={mentionStyle}>
    //         @{username}
    //     </Link>
    // );

    // Non-linked version:
    return (
        <span className={mentionStyle}>
            @{username}
        </span>
    );
};

export default Mention;