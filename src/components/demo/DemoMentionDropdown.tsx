'use client';

import React from 'react';

interface DemoUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
}

interface DemoMentionDropdownProps {
  users: DemoUser[];
  query: string;
  onSelect: (user: DemoUser) => void;
  position: { top: number; left: number };
}

/**
 * A dropdown component for @mentions in demo mode.
 */
const DemoMentionDropdown: React.FC<DemoMentionDropdownProps> = ({
  users,
  query,
  onSelect,
  position,
}) => {
  // Filter users based on the query
  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(query.toLowerCase()) ||
    user.username.toLowerCase().includes(query.toLowerCase())
  );

  if (filteredUsers.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed z-[9999] bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 w-64 max-h-48 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      <ul className="py-1">
        {filteredUsers.map(user => (
          <button
            key={user.id}
            type="button"
            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(user);
            }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                {user.displayName.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-medium text-sm">{user.displayName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</div>
            </div>
          </button>
        ))}
      </ul>
    </div>
  );
};

export default DemoMentionDropdown;
