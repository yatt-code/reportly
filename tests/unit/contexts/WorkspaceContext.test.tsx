import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkspaceProvider, useWorkspace } from '@/contexts/WorkspaceContext';
import { getUserWorkspaces } from '@/app/actions/workspace/getUserWorkspaces';
import { setActiveWorkspace } from '@/app/actions/workspace/setActiveWorkspace';

// Mock dependencies
jest.mock('@/lib/useUser', () => ({
  useUser: jest.fn(),
}));

jest.mock('@/app/actions/workspace/getUserWorkspaces', () => ({
  getUserWorkspaces: jest.fn(),
}));

jest.mock('@/app/actions/workspace/setActiveWorkspace', () => ({
  setActiveWorkspace: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

// Test component that uses the workspace context
const TestComponent = () => {
  const { activeWorkspaceId, workspaces, isLoading, error } = useWorkspace();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <div data-testid="active-workspace">{activeWorkspaceId || 'No active workspace'}</div>
      <div data-testid="workspace-count">{workspaces.length}</div>
      <ul>
        {workspaces.map(ws => (
          <li key={ws.id} data-testid={`workspace-${ws.id}`}>{ws.name}</li>
        ))}
      </ul>
    </div>
  );
};

describe('WorkspaceContext', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (getUserWorkspaces as jest.Mock).mockResolvedValue({
      success: true,
      workspaces: [
        { id: 'ws1', name: 'Workspace 1', organizationId: 'org1', type: 'team' },
        { id: 'ws2', name: 'Workspace 2', organizationId: 'org1', type: 'project' },
      ],
    });
    
    (setActiveWorkspace as jest.Mock).mockResolvedValue({
      success: true,
    });
    
    // Mock useUser
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: { id: 'user1' },
      isAuthenticated: true,
      isLoading: false,
    });
  });
  
  it('should load workspaces when user is authenticated', async () => {
    await act(async () => {
      render(
        <WorkspaceProvider>
          <TestComponent />
        </WorkspaceProvider>
      );
    });
    
    // Check that getUserWorkspaces was called
    expect(getUserWorkspaces).toHaveBeenCalled();
    
    // Check that workspaces are rendered
    expect(screen.getByTestId('workspace-count')).toHaveTextContent('2');
    expect(screen.getByTestId('workspace-ws1')).toHaveTextContent('Workspace 1');
    expect(screen.getByTestId('workspace-ws2')).toHaveTextContent('Workspace 2');
    
    // Check that the first workspace is set as active by default
    expect(screen.getByTestId('active-workspace')).toHaveTextContent('ws1');
  });
  
  it('should show loading state', async () => {
    // Mock useUser to return loading state
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
    
    render(
      <WorkspaceProvider>
        <TestComponent />
      </WorkspaceProvider>
    );
    
    // Check that loading state is shown
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Check that getUserWorkspaces was not called while loading
    expect(getUserWorkspaces).not.toHaveBeenCalled();
  });
  
  it('should handle error state', async () => {
    // Mock getUserWorkspaces to return an error
    (getUserWorkspaces as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Failed to fetch workspaces',
    });
    
    await act(async () => {
      render(
        <WorkspaceProvider>
          <TestComponent />
        </WorkspaceProvider>
      );
    });
    
    // Check that error state is shown
    expect(screen.getByText('Error: Failed to fetch workspaces')).toBeInTheDocument();
  });
  
  it('should handle empty workspaces array', async () => {
    // Mock getUserWorkspaces to return an empty array
    (getUserWorkspaces as jest.Mock).mockResolvedValue({
      success: true,
      workspaces: [],
    });
    
    await act(async () => {
      render(
        <WorkspaceProvider>
          <TestComponent />
        </WorkspaceProvider>
      );
    });
    
    // Check that workspace count is 0
    expect(screen.getByTestId('workspace-count')).toHaveTextContent('0');
    
    // Check that no active workspace is set
    expect(screen.getByTestId('active-workspace')).toHaveTextContent('No active workspace');
  });
});
