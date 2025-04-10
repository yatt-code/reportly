import { setActiveWorkspace } from '@/app/actions/workspace/setActiveWorkspace';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db/connectDB';
import User from '@/models/User';
import { Workspace } from '@/models/Workspace';
import logger from '@/lib/utils/logger';
import { hasWorkspaceAccess } from '@/lib/rbac/workspaceAccess';

// Mock dependencies
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/db/connectDB', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/models/User', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

jest.mock('@/models/Workspace', () => ({
  __esModule: true,
  Workspace: {
    findById: jest.fn(),
  },
}));

jest.mock('@/lib/rbac/workspaceAccess', () => ({
  hasWorkspaceAccess: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('setActiveWorkspace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set the active workspace when all conditions are met', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock User.findOne
    const mockUserSave = jest.fn().mockResolvedValue(undefined);
    (User.findOne as jest.Mock).mockResolvedValue({
      _id: 'user-mongo-id',
      supabaseUserId: 'user-123',
      organizationId: 'org-123',
      workspaceIds: ['ws-1', 'ws-2'],
      activeWorkspaceId: 'ws-1',
      save: mockUserSave,
    });

    // Mock Workspace.findById
    (Workspace.findById as jest.Mock).mockResolvedValue({
      _id: 'ws-2',
      name: 'Test Workspace',
      organizationId: 'org-123',
      memberIds: ['user-mongo-id'],
    });

    // Call the function
    const result = await setActiveWorkspace('ws-2');

    // Check the result
    expect(result).toEqual({
      success: true,
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(Workspace.findById).toHaveBeenCalledWith('ws-2');
    expect(mockUserSave).toHaveBeenCalled();
  });

  it('should return error when workspace ID is empty', async () => {
    // Call the function with empty workspace ID
    const result = await setActiveWorkspace('');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('Invalid input'),
    });

    // Check that the dependencies were not called
    expect(getCurrentUser).not.toHaveBeenCalled();
    expect(connectDB).not.toHaveBeenCalled();
  });

  it('should return error when user is not authenticated', async () => {
    // Mock getCurrentUser to return null
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    // Call the function
    const result = await setActiveWorkspace('ws-2');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'Authentication required.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).not.toHaveBeenCalled();
  });

  it('should return error when user profile is not found', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock User.findOne to return null
    (User.findOne as jest.Mock).mockResolvedValue(null);

    // Call the function
    const result = await setActiveWorkspace('ws-2');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'User profile not found.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
  });

  it('should return error when workspace is not found', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock User.findOne
    (User.findOne as jest.Mock).mockResolvedValue({
      _id: 'user-mongo-id',
      supabaseUserId: 'user-123',
      organizationId: 'org-123',
      workspaceIds: ['ws-1', 'ws-2'],
      activeWorkspaceId: 'ws-1',
    });

    // Mock Workspace.findById to return null
    (Workspace.findById as jest.Mock).mockResolvedValue(null);

    // Call the function
    const result = await setActiveWorkspace('ws-2');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'Workspace not found.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(Workspace.findById).toHaveBeenCalledWith('ws-2');
  });

  it('should return error when user does not have access to the workspace', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock User.findOne
    (User.findOne as jest.Mock).mockResolvedValue({
      _id: 'user-mongo-id',
      supabaseUserId: 'user-123',
      organizationId: 'org-123',
      workspaceIds: ['ws-1', 'ws-2'],
      activeWorkspaceId: 'ws-1',
    });

    // Mock Workspace.findById
    (Workspace.findById as jest.Mock).mockResolvedValue({
      _id: 'ws-2',
      name: 'Test Workspace',
      organizationId: 'org-123',
      memberIds: ['other-user-id'], // User is not a member
    });

    // Call the function
    const result = await setActiveWorkspace('ws-2');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'You are not a member of this workspace.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(Workspace.findById).toHaveBeenCalledWith('ws-2');
  });

  it('should handle errors', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock connectDB to throw an error
    (connectDB as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

    // Call the function
    const result = await setActiveWorkspace('ws-2');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'Failed to set active workspace due to a server error.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });
});
