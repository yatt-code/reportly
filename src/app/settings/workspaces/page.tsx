'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUser } from '@/lib/useUser';
import { setActiveWorkspace } from '@/app/actions/workspace/setActiveWorkspace';
import { createWorkspace } from '@/app/actions/workspace/createWorkspace';
import { updateWorkspace } from '@/app/actions/workspace/updateWorkspace';
import { deleteWorkspace } from '@/app/actions/workspace/deleteWorkspace';
import { getOrganization } from '@/app/actions/organization/getOrganization';
import { Briefcase, Plus, Trash, Edit, Check, X, Loader2, Building } from 'lucide-react';
import logger from '@/lib/utils/logger';

/**
 * Workspace Management Page
 *
 * Allows users to view, create, edit, and delete workspaces.
 */
export default function WorkspacesPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const {
    workspaces,
    activeWorkspaceId,
    isLoading: isWorkspacesLoading,
    error: workspacesError,
    refreshWorkspaces
  } = useWorkspace();

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [editWorkspaceName, setEditWorkspaceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null);
  const [isCheckingOrg, setIsCheckingOrg] = useState(true);

  // Handle workspace creation
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newWorkspaceName.trim()) {
      setErrorMessage('Workspace name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Call the createWorkspace server action
      const result = await createWorkspace(newWorkspaceName);

      if (result.success) {
        await refreshWorkspaces();
        setNewWorkspaceName('');
        setIsCreating(false);
      } else {
        setErrorMessage(result.error);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(`Failed to create workspace: ${error}`);
      logger.error('Error creating workspace:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle workspace editing
  const handleEditWorkspace = async (workspaceId: string) => {
    if (!editWorkspaceName.trim()) {
      setErrorMessage('Workspace name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Call the updateWorkspace server action
      const result = await updateWorkspace(workspaceId, editWorkspaceName);

      if (result.success) {
        await refreshWorkspaces();
        setIsEditing(null);
      } else {
        setErrorMessage(result.error);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(`Failed to update workspace: ${error}`);
      logger.error('Error updating workspace:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle workspace deletion
  const handleDeleteWorkspace = async (workspaceId: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Call the deleteWorkspace server action
      const result = await deleteWorkspace(workspaceId);

      if (result.success) {
        await refreshWorkspaces();
        setIsDeleting(null);
      } else {
        setErrorMessage(result.error);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(`Failed to delete workspace: ${error}`);
      logger.error('Error deleting workspace:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle setting active workspace
  const handleSetActiveWorkspace = async (workspaceId: string) => {
    if (workspaceId === activeWorkspaceId) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await setActiveWorkspace(workspaceId);

      if (result.success) {
        await refreshWorkspaces();
      } else {
        setErrorMessage(result.error);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(`Failed to set active workspace: ${error}`);
      logger.error('Error setting active workspace:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing a workspace
  const startEditing = (workspace: { id: string; name: string }) => {
    setIsEditing(workspace.id);
    setEditWorkspaceName(workspace.name);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(null);
    setErrorMessage(null);
  };

  // Start deleting a workspace
  const startDeleting = (workspaceId: string) => {
    setIsDeleting(workspaceId);
  };

  // Cancel deleting
  const cancelDeleting = () => {
    setIsDeleting(null);
    setErrorMessage(null);
  };

  // Check if the user has an organization
  useEffect(() => {
    const checkOrganization = async () => {
      if (!user) return;

      try {
        const result = await getOrganization();
        setHasOrganization(result.success);
      } catch (err) {
        setHasOrganization(false);
        logger.error('Error checking organization:', err);
      } finally {
        setIsCheckingOrg(false);
      }
    };

    checkOrganization();
  }, [user]);

  // Loading state
  if (isUserLoading || isWorkspacesLoading || isCheckingOrg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading workspaces...</p>
      </div>
    );
  }

  // No organization state
  if (hasOrganization === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">No Organization Found</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            You need to create an organization before you can manage workspaces.
          </p>
          <button
            onClick={() => router.push('/settings/organization')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Create Organization
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (workspacesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
          <p>Error loading workspaces: {workspacesError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Workspace Management</h1>

        {/* Create Workspace Button */}
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workspace
          </button>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Create Workspace Form */}
      {isCreating && (
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Create New Workspace</h2>
          <form onSubmit={handleCreateWorkspace} className="flex flex-col space-y-4">
            <div>
              <label htmlFor="workspace-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Workspace Name
              </label>
              <input
                id="workspace-name"
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter workspace name"
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors flex items-center"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workspaces List */}
      <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Your Workspaces</h2>
        </div>

        {workspaces.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>You don't have any workspaces yet.</p>
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Workspace
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {workspaces.map((workspace) => (
              <li key={workspace.id} className="p-4">
                {isEditing === workspace.id ? (
                  // Edit Mode
                  <div className="flex flex-col space-y-3">
                    <input
                      type="text"
                      value={editWorkspaceName}
                      onChange={(e) => setEditWorkspaceName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      disabled={isSubmitting}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditWorkspace(workspace.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center text-sm"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors flex items-center text-sm"
                        disabled={isSubmitting}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : isDeleting === workspace.id ? (
                  // Delete Confirmation
                  <div className="flex flex-col space-y-3">
                    <p className="text-red-600 dark:text-red-400">
                      Are you sure you want to delete this workspace? This action cannot be undone.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center text-sm"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash className="w-3 h-3 mr-1" />
                            Delete
                          </>
                        )}
                      </button>
                      <button
                        onClick={cancelDeleting}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors flex items-center text-sm"
                        disabled={isSubmitting}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                          {workspace.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Type: {workspace.type.charAt(0).toUpperCase() + workspace.type.slice(1)}
                        </p>
                      </div>
                      {workspace.id === activeWorkspaceId && (
                        <span className="ml-3 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {workspace.id !== activeWorkspaceId && (
                        <button
                          onClick={() => handleSetActiveWorkspace(workspace.id)}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-800 dark:text-blue-300 rounded-md transition-colors text-sm"
                          disabled={isSubmitting}
                        >
                          Set Active
                        </button>
                      )}
                      <button
                        onClick={() => startEditing(workspace)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
                        disabled={isSubmitting}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startDeleting(workspace.id)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
                        disabled={isSubmitting || workspace.id === activeWorkspaceId}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
