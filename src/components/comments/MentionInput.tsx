'use client';

import React, { useState, useCallback, useRef } from 'react'; // Import useRef
import { MentionsInput, Mention, SuggestionDataItem } from 'react-mentions';
import logger from '@/lib/utils/logger';
// Default styles for react-mentions - adjust or replace with Tailwind later
// import 'react-mentions/lib/styles.css';
// Or create custom styles using Tailwind

interface MentionInputProps {
    value: string;
    onChange: (newValue: string) => void;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    className?: string; // Allow passing custom classes
}

// Define the structure of user data expected from the API
interface MentionUserData extends SuggestionDataItem {
    id: string; // Supabase User ID (or username if used as ID)
    display: string; // The @username handle
    name: string; // Full display name
}

/**
 * A textarea component with @mention autocomplete functionality.
 * Uses react-mentions library and fetches users from the API.
 */
const MentionInput: React.FC<MentionInputProps> = ({
    value,
    onChange,
    placeholder = "Write something...",
    rows = 3,
    disabled = false,
    className = "", // Default empty string
}) => {
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    // Ref to store cached user results for the current interaction
    const userCache = useRef<Map<string, MentionUserData[]>>(new Map());

    // Function to fetch users for mention suggestions with caching
    const fetchUsers = useCallback(
        async (query: string, callback: (data: MentionUserData[]) => void): Promise<void> => {
            if (!query) {
                return callback([]);
            }

            // Check cache first
            if (userCache.current.has(query)) {
                logger.log('[MentionInput] Using cached users for query:', { query });
                return callback(userCache.current.get(query)!);
            }
            // Check cache for broader queries (e.g., if 'al' is cached, use for 'ali')
            const cachedQueries = Array.from(userCache.current.keys());
            const relevantCacheKey = cachedQueries.find(key => query.startsWith(key));
            if (relevantCacheKey) {
                 const cachedUsers = userCache.current.get(relevantCacheKey)!;
                 // Filter cached users based on the more specific query
                 const filteredUsers = cachedUsers.filter(user =>
                     user.display?.toLowerCase().includes(query.toLowerCase()) || // Use display for username check
                     user.name?.toLowerCase().includes(query.toLowerCase())
                 );
                 logger.log('[MentionInput] Using filtered cached users for query:', { query, cacheKey: relevantCacheKey });
                 return callback(filteredUsers);
            }


            setIsLoadingUsers(true);
            logger.log('[MentionInput] Fetching users from API for mention...', { query });
            try {
                const response = await fetch(`/api/users-in-group`); // Add ?q=${query} if API supports it
                if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
                const data = await response.json();

                if (data.users && Array.isArray(data.users)) {
                    const usersForMentions: MentionUserData[] = data.users.map((user: any) => ({
                        id: user.username,
                        display: user.username,
                        name: user.name,
                    }));

                    // Store full result in cache before filtering for the specific query
                    // Use a broader key if possible, or just the query for simplicity now
                    userCache.current.set(query, usersForMentions);
                    logger.log('[MentionInput] API users fetched and cached.', { query, count: usersForMentions.length });

                    // Filter for the current query before calling callback
                     const filteredForCallback = usersForMentions.filter(user =>
                         user.display?.toLowerCase().includes(query.toLowerCase()) || // Use display for username check
                         user.name?.toLowerCase().includes(query.toLowerCase())
                     );
                    callback(filteredForCallback);

                } else {
                    logger.warn('[MentionInput] API response missing users array.');
                    callback([]);
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                logger.error('[MentionInput] Failed to fetch users.', error);
                callback([]);
            } finally {
                setIsLoadingUsers(false);
            }
        },
        [] // Dependencies remain empty for this simple cache strategy
    );

    // Basic Tailwind-like styling for the mentions input and suggestions
    // You'll need to configure Tailwind to apply these or use a CSS file
    const defaultStyle = {
        control: {
            backgroundColor: '#fff', // dark:bg-gray-700
            fontSize: 14,
            fontWeight: 'normal',
        },
        '&multiLine': {
            control: {
                minHeight: 63, // Adjust based on rows
            },
            highlighter: {
                padding: 9,
                border: '1px solid transparent',
            },
            input: {
                padding: 9,
                border: '1px solid #d1d5db', // dark:border-gray-600
                borderRadius: '0.375rem', // rounded-md
                outline: 'none',
                // Add focus styles if needed
            },
        },
        suggestions: {
            list: {
                backgroundColor: 'white', // dark:bg-gray-800
                border: '1px solid rgba(0,0,0,0.15)', // dark:border-gray-600
                fontSize: 14,
                borderRadius: '0.375rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // shadow-md
                maxHeight: '150px',
                overflowY: 'auto' as 'auto', // Cast to satisfy specific type
            },
            item: {
                padding: '5px 15px',
                borderBottom: '1px solid rgba(0,0,0,0.1)', // dark:border-gray-700
                '&focused': {
                    backgroundColor: '#f3f4f6', // dark:bg-gray-700
                },
            },
        },
        mention: {
             color: '#2563eb', // text-blue-600
             fontWeight: 'bold',
             backgroundColor: '#eff6ff', // bg-blue-100 (light mode)
             // Add dark mode background if needed: dark:bg-blue-900/50
             padding: '1px 3px',
             borderRadius: '0.25rem',
        }
    };


    return (
        <MentionsInput
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`mention-input-container ${className}`}
            style={defaultStyle}
            rows={rows}
            a11ySuggestionsListLabel={"Suggested users to mention"}
        >
            <Mention
                trigger="@"
                data={fetchUsers}
                displayTransform={(id, display) => `@${display}`}
                renderSuggestion={(
                    suggestion: SuggestionDataItem,
                    search,
                    highlightedDisplay,
                    index,
                    focused
                ) => {
                    const userSuggestion = suggestion as MentionUserData;
                    return (
                        <div
                            className={`suggestion-item ${focused ? 'focused bg-gray-100 dark:bg-gray-700' : ''}`}
                            role="option"
                            aria-selected={focused}
                        >
                            <span className="font-semibold">{userSuggestion.name}</span>{' '}
                            <span className="text-sm text-gray-500">@{userSuggestion.display}</span>
                        </div>
                    );
                }}
                markup="@__display__" // Template for insertion
                appendSpaceOnAdd={true} // Add space after mention
            />
            {/* Add other Mention triggers here if needed */}
        </MentionsInput>
    );
};

export default MentionInput;