'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useUser } from '@/lib/useUser';
import logger from '@/lib/utils/logger';
import { getUserWorkspaces } from '@/app/actions/workspace/getUserWorkspaces';

// Define the shape of a workspace object
export interface WorkspaceInfo {
  id: string;
  name: string;
  organizationId: string;
  type: 'team' | 'department' | 'project';
}

// Define the shape of the workspace context
interface WorkspaceContextType {
  activeWorkspaceId: string | null;
  workspaces: WorkspaceInfo[];
  isLoading: boolean;
  error: string | null;
  setActiveWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

// Create the context with a default undefined value
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

/**
 * Provider component for workspace context
 */
export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading: isUserLoading } = useUser();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch user's workspaces
  const fetchWorkspaces = async () => {
    if (!isAuthenticated || isUserLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserWorkspaces();
      
      if (result.success) {
        setWorkspaces(result.workspaces);
        
        // If no active workspace is set, use the first one
        if (!activeWorkspaceId && result.workspaces.length > 0) {
          setActiveWorkspaceId(result.workspaces[0].id);
        }
      } else {
        setError(result.error);
        logger.error('Failed to fetch workspaces:', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching workspaces';
      setError(errorMessage);
      logger.error('Error fetching workspaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch workspaces when the user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isUserLoading) {
      fetchWorkspaces();
    }
  }, [isAuthenticated, isUserLoading]);

  // Function to set the active workspace
  const setActiveWorkspace = async (workspaceId: string) => {
    try {
      // Validate that the workspace exists
      const workspaceExists = workspaces.some(ws => ws.id === workspaceId);
      
      if (!workspaceExists) {
        throw new Error(`Workspace with ID ${workspaceId} not found`);
      }
      
      // Update the active workspace
      setActiveWorkspaceId(workspaceId);
      
      // TODO: Call server action to update user's activeWorkspaceId in the database
      // await updateActiveWorkspace(workspaceId);
      
      logger.log(`Active workspace set to: ${workspaceId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error setting active workspace';
      setError(errorMessage);
      logger.error('Error setting active workspace:', err);
      throw err;
    }
  };

  // Provide the context value
  const contextValue: WorkspaceContextType = {
    activeWorkspaceId,
    workspaces,
    isLoading,
    error,
    setActiveWorkspace,
    refreshWorkspaces: fetchWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

/**
 * Hook to use the workspace context
 */
export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  
  return context;
};
