'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { setActiveWorkspace } from '@/app/actions/workspace/setActiveWorkspace';
import { ChevronDown, Briefcase, Loader2 } from 'lucide-react';
import logger from '@/lib/utils/logger';

interface WorkspaceSwitcherProps {
  className?: string;
}

/**
 * Component for switching between workspaces
 */
const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ className = '' }) => {
  const { activeWorkspaceId, workspaces, isLoading, error, refreshWorkspaces } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // Get the active workspace name
  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId);
  const activeWorkspaceName = activeWorkspace?.name || 'Select Workspace';

  // Toggle the dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Handle workspace selection
  const handleSelectWorkspace = async (workspaceId: string) => {
    if (workspaceId === activeWorkspaceId) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    try {
      // Call the server action to update the active workspace
      const result = await setActiveWorkspace(workspaceId);
      
      if (result.success) {
        // Update the context
        await refreshWorkspaces();
        logger.log('Workspace switched successfully', { workspaceId });
      } else {
        logger.error('Failed to switch workspace', { error: result.error });
        // Show error message
        alert(`Failed to switch workspace: ${result.error}`);
      }
    } catch (err) {
      logger.error('Error switching workspace', { error: err });
      // Show error message
      alert('An error occurred while switching workspace');
    } finally {
      setIsChanging(false);
      setIsOpen(false);
    }
  };

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading workspaces...</span>
      </div>
    );
  }

  // If error, show an error message
  if (error) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-md bg-red-100 dark:bg-red-900/20 ${className}`}>
        <span className="text-sm text-red-600 dark:text-red-400">Error loading workspaces</span>
      </div>
    );
  }

  // If no workspaces, show a message
  if (workspaces.length === 0) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 ${className}`}>
        <span className="text-sm text-gray-500 dark:text-gray-400">No workspaces available</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Workspace Selector Button */}
      <button
        onClick={toggleDropdown}
        disabled={isChanging}
        className="flex items-center space-x-2 px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors"
      >
        <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium truncate max-w-[150px]">
          {isChanging ? 'Switching...' : activeWorkspaceName}
        </span>
        {isChanging ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => handleSelectWorkspace(workspace.id)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                workspace.id === activeWorkspaceId
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {workspace.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
