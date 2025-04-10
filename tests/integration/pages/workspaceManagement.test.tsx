import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkspacesPage from '@/app/settings/workspaces/page';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { createWorkspace } from '@/app/actions/workspace/createWorkspace';
import { updateWorkspace } from '@/app/actions/workspace/updateWorkspace';
import { deleteWorkspace } from '@/app/actions/workspace/deleteWorkspace';
import { getOrganization } from '@/app/actions/organization/getOrganization';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/lib/useUser', () => ({
  useUser: jest.fn().mockReturnValue({
    user: { id: 'user-123', name: 'Test User' },
    isLoading: false,
  }),
}));

jest.mock('@/contexts/WorkspaceContext', () => ({
  WorkspaceProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useWorkspace: jest.fn(),
}));

jest.mock('@/app/actions/workspace/createWorkspace', () => ({
  createWorkspace: jest.fn(),
}));

jest.mock('@/app/actions/workspace/updateWorkspace', () => ({
  updateWorkspace: jest.fn(),
}));

jest.mock('@/app/actions/workspace/deleteWorkspace', () => ({
  deleteWorkspace: jest.fn(),
}));

jest.mock('@/app/actions/organization/getOrganization', () => ({
  getOrganization: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('Workspace Management Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state', () => {
    // Mock useWorkspace to return loading state
    const useWorkspaceMock = require('@/contexts/WorkspaceContext').useWorkspace;
    useWorkspaceMock.mockReturnValue({
      workspaces: [],
      activeWorkspaceId: null,
      isLoading: true,
      error: null,
      refreshWorkspaces: jest.fn(),
    });

    // Mock getOrganization to return success
    (getOrganization as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'org-123', name: 'Test Organization' },
    });

    render(<WorkspacesPage />);

    // Check that loading state is shown
    expect(screen.getByText('Loading workspaces...')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    // Mock useWorkspace to return error state
    const useWorkspaceMock = require('@/contexts/WorkspaceContext').useWorkspace;
    useWorkspaceMock.mockReturnValue({
      workspaces: [],
      activeWorkspaceId: null,
      isLoading: false,
      error: 'Failed to load workspaces',
      refreshWorkspaces: jest.fn(),
    });

    // Mock getOrganization to return success
    (getOrganization as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'org-123', name: 'Test Organization' },
    });

    render(<WorkspacesPage />);

    // Wait for the component to check for organization
    await waitFor(() => {
      // Check that error state is shown
      expect(screen.getByText(/Error loading workspaces/)).toBeInTheDocument();
    });
  });

  it('should show no organization state', async () => {
    // Mock useWorkspace
    const useWorkspaceMock = require('@/contexts/WorkspaceContext').useWorkspace;
    useWorkspaceMock.mockReturnValue({
      workspaces: [],
      activeWorkspaceId: null,
      isLoading: false,
      error: null,
      refreshWorkspaces: jest.fn(),
    });

    // Mock getOrganization to return failure
    (getOrganization as jest.Mock).mockResolvedValue({
      success: false,
      error: 'User has no organization',
    });

    render(<WorkspacesPage />);

    // Wait for the component to check for organization
    await waitFor(() => {
      expect(screen.getByText('No Organization Found')).toBeInTheDocument();
    });

    // Check that the create organization button is shown
    expect(screen.getByText('Create Organization')).toBeInTheDocument();
  });

  it('should show empty workspaces state', async () => {
    // Mock useWorkspace to return empty workspaces
    const useWorkspaceMock = require('@/contexts/WorkspaceContext').useWorkspace;
    useWorkspaceMock.mockReturnValue({
      workspaces: [],
      activeWorkspaceId: null,
      isLoading: false,
      error: null,
      refreshWorkspaces: jest.fn(),
    });

    // Mock getOrganization to return success
    (getOrganization as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'org-123', name: 'Test Organization' },
    });

    render(<WorkspacesPage />);

    // Wait for the component to check for organization
    await waitFor(() => {
      expect(screen.getByText('You don\'t have any workspaces yet.')).toBeInTheDocument();
    });

    // Check that the create workspace button is shown
    expect(screen.getByText('Create Your First Workspace')).toBeInTheDocument();
  });

  it('should show workspaces list', async () => {
    // Mock useWorkspace to return workspaces
    const useWorkspaceMock = require('@/contexts/WorkspaceContext').useWorkspace;
    useWorkspaceMock.mockReturnValue({
      workspaces: [
        { id: 'ws-1', name: 'Workspace 1', organizationId: 'org-123', type: 'team' },
        { id: 'ws-2', name: 'Workspace 2', organizationId: 'org-123', type: 'project' },
      ],
      activeWorkspaceId: 'ws-1',
      isLoading: false,
      error: null,
      refreshWorkspaces: jest.fn(),
    });

    // Mock getOrganization to return success
    (getOrganization as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'org-123', name: 'Test Organization' },
    });

    render(<WorkspacesPage />);

    // Wait for the component to check for organization
    await waitFor(() => {
      expect(screen.getByText('Workspace 1')).toBeInTheDocument();
    });

    // Check that both workspaces are shown
    expect(screen.getByText('Workspace 2')).toBeInTheDocument();

    // Check that the active workspace is marked
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should create a workspace', async () => {
    // Mock useWorkspace
    const mockRefreshWorkspaces = jest.fn();
    const useWorkspaceMock = require('@/contexts/WorkspaceContext').useWorkspace;
    useWorkspaceMock.mockReturnValue({
      workspaces: [],
      activeWorkspaceId: null,
      isLoading: false,
      error: null,
      refreshWorkspaces: mockRefreshWorkspaces,
    });

    // Mock getOrganization to return success
    (getOrganization as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'org-123', name: 'Test Organization' },
    });

    // Mock createWorkspace to return success
    (createWorkspace as jest.Mock).mockResolvedValue({
      success: true,
      workspaceId: 'ws-new',
    });

    render(<WorkspacesPage />);

    // Wait for the component to check for organization
    await waitFor(() => {
      expect(screen.getByText('Create Your First Workspace')).toBeInTheDocument();
    });

    // Click the create workspace button
    fireEvent.click(screen.getByText('Create Your First Workspace'));

    // Check that the create workspace form is shown
    expect(screen.getByText('Create New Workspace')).toBeInTheDocument();

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Workspace Name'), {
      target: { value: 'New Workspace' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Create'));

    // Check that createWorkspace was called with the correct arguments
    await waitFor(() => {
      expect(createWorkspace).toHaveBeenCalledWith('New Workspace');
    });

    // Check that refreshWorkspaces was called
    expect(mockRefreshWorkspaces).toHaveBeenCalled();
  });
});
