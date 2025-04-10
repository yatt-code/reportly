import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkspaceSwitcher from '@/components/workspace/WorkspaceSwitcher';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { setActiveWorkspace } from '@/app/actions/workspace/setActiveWorkspace';

// Mock dependencies
jest.mock('@/contexts/WorkspaceContext', () => ({
  useWorkspace: jest.fn(),
}));

jest.mock('@/app/actions/workspace/setActiveWorkspace', () => ({
  setActiveWorkspace: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('WorkspaceSwitcher', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (setActiveWorkspace as jest.Mock).mockResolvedValue({
      success: true,
    });
    
    // Mock useWorkspace
    const useWorkspaceMock = useWorkspace as jest.Mock;
    useWorkspaceMock.mockReturnValue({
      activeWorkspaceId: 'ws1',
      workspaces: [
        { id: 'ws1', name: 'Workspace 1', organizationId: 'org1', type: 'team' },
        { id: 'ws2', name: 'Workspace 2', organizationId: 'org1', type: 'project' },
      ],
      isLoading: false,
      error: null,
      setActiveWorkspace: jest.fn(),
      refreshWorkspaces: jest.fn(),
    });
  });
  
  it('should render the active workspace name', () => {
    render(<WorkspaceSwitcher />);
    
    // Check that the active workspace name is displayed
    expect(screen.getByText('Workspace 1')).toBeInTheDocument();
  });
  
  it('should show loading state', () => {
    // Mock useWorkspace to return loading state
    const useWorkspaceMock = useWorkspace as jest.Mock;
    useWorkspaceMock.mockReturnValue({
      activeWorkspaceId: null,
      workspaces: [],
      isLoading: true,
      error: null,
      setActiveWorkspace: jest.fn(),
      refreshWorkspaces: jest.fn(),
    });
    
    render(<WorkspaceSwitcher />);
    
    // Check that loading state is shown
    expect(screen.getByText('Loading workspaces...')).toBeInTheDocument();
  });
  
  it('should show error state', () => {
    // Mock useWorkspace to return error state
    const useWorkspaceMock = useWorkspace as jest.Mock;
    useWorkspaceMock.mockReturnValue({
      activeWorkspaceId: null,
      workspaces: [],
      isLoading: false,
      error: 'Failed to load workspaces',
      setActiveWorkspace: jest.fn(),
      refreshWorkspaces: jest.fn(),
    });
    
    render(<WorkspaceSwitcher />);
    
    // Check that error state is shown
    expect(screen.getByText('Error loading workspaces')).toBeInTheDocument();
  });
  
  it('should show empty state when no workspaces are available', () => {
    // Mock useWorkspace to return empty workspaces array
    const useWorkspaceMock = useWorkspace as jest.Mock;
    useWorkspaceMock.mockReturnValue({
      activeWorkspaceId: null,
      workspaces: [],
      isLoading: false,
      error: null,
      setActiveWorkspace: jest.fn(),
      refreshWorkspaces: jest.fn(),
    });
    
    render(<WorkspaceSwitcher />);
    
    // Check that empty state is shown
    expect(screen.getByText('No workspaces available')).toBeInTheDocument();
  });
  
  it('should open dropdown when clicked', () => {
    render(<WorkspaceSwitcher />);
    
    // Check that dropdown is initially closed
    expect(screen.queryByText('Workspace 2')).not.toBeInTheDocument();
    
    // Click the button to open the dropdown
    fireEvent.click(screen.getByText('Workspace 1'));
    
    // Check that dropdown is open
    expect(screen.getByText('Workspace 2')).toBeInTheDocument();
  });
  
  it('should call setActiveWorkspace when a workspace is selected', async () => {
    const mockRefreshWorkspaces = jest.fn();
    
    // Mock useWorkspace
    const useWorkspaceMock = useWorkspace as jest.Mock;
    useWorkspaceMock.mockReturnValue({
      activeWorkspaceId: 'ws1',
      workspaces: [
        { id: 'ws1', name: 'Workspace 1', organizationId: 'org1', type: 'team' },
        { id: 'ws2', name: 'Workspace 2', organizationId: 'org1', type: 'project' },
      ],
      isLoading: false,
      error: null,
      setActiveWorkspace: jest.fn(),
      refreshWorkspaces: mockRefreshWorkspaces,
    });
    
    render(<WorkspaceSwitcher />);
    
    // Open the dropdown
    fireEvent.click(screen.getByText('Workspace 1'));
    
    // Click on the second workspace
    fireEvent.click(screen.getByText('Workspace 2'));
    
    // Check that setActiveWorkspace was called with the correct workspace ID
    await waitFor(() => {
      expect(setActiveWorkspace).toHaveBeenCalledWith('ws2');
    });
    
    // Check that refreshWorkspaces was called
    await waitFor(() => {
      expect(mockRefreshWorkspaces).toHaveBeenCalled();
    });
  });
});
