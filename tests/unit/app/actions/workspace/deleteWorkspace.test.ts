import { deleteWorkspace } from '@/app/actions/workspace/deleteWorkspace';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db/connectDB';
import User from '@/models/User';
import { Workspace } from '@/models/Workspace';
import Report from '@/models/Report';
import CommentModel from '@/models/Comment';
import logger from '@/lib/utils/logger';
import { enforceWorkspaceAccess } from '@/lib/rbac/workspaceAccess';

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
    updateMany: jest.fn(),
  },
}));

jest.mock('@/models/Workspace', () => ({
  __esModule: true,
  Workspace: {
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.mock('@/models/Report', () => ({
  __esModule: true,
  default: {
    deleteMany: jest.fn(),
  },
}));

jest.mock('@/models/Comment', () => ({
  __esModule: true,
  default: {
    deleteMany: jest.fn(),
  },
}));

jest.mock('@/lib/rbac/workspaceAccess', () => ({
  enforceWorkspaceAccess: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('deleteWorkspace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a workspace and associated data when all conditions are met', async () => {
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
      activeWorkspaceId: 'ws-2',
    });

    // Mock enforceWorkspaceAccess
    (enforceWorkspaceAccess as jest.Mock).mockResolvedValue(undefined);

    // Mock Workspace.findById
    (Workspace.findById as jest.Mock).mockResolvedValue({
      _id: 'ws-1',
      name: 'Test Workspace',
      organizationId: 'org-123',
      memberIds: ['user-mongo-id'],
    });

    // Mock Report.deleteMany
    (Report.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 5 });

    // Mock CommentModel.deleteMany
    (CommentModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 10 });

    // Mock User.updateMany
    (User.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 2 });

    // Mock Workspace.findByIdAndDelete
    (Workspace.findByIdAndDelete as jest.Mock).mockResolvedValue({
      _id: 'ws-1',
      name: 'Test Workspace',
    });

    // Call the function
    const result = await deleteWorkspace('ws-1');

    // Check the result
    expect(result).toEqual({
      success: true,
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(enforceWorkspaceAccess).toHaveBeenCalledWith('user-123', 'ws-1');
    expect(Workspace.findById).toHaveBeenCalledWith('ws-1');
    expect(Report.deleteMany).toHaveBeenCalledWith({ workspaceId: 'ws-1' });
    expect(CommentModel.deleteMany).toHaveBeenCalledWith({ workspaceId: 'ws-1' });
    expect(User.updateMany).toHaveBeenCalledWith(
      { workspaceIds: 'ws-1' },
      { $pull: { workspaceIds: 'ws-1' } }
    );
    expect(Workspace.findByIdAndDelete).toHaveBeenCalledWith('ws-1');
  });

  it('should return error when workspace ID is empty', async () => {
    // Call the function with empty workspace ID
    const result = await deleteWorkspace('');

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
    const result = await deleteWorkspace('ws-1');

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
    const result = await deleteWorkspace('ws-1');

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
      activeWorkspaceId: 'ws-2',
    });

    // Mock enforceWorkspaceAccess
    (enforceWorkspaceAccess as jest.Mock).mockResolvedValue(undefined);

    // Mock Workspace.findById to return null
    (Workspace.findById as jest.Mock).mockResolvedValue(null);

    // Call the function
    const result = await deleteWorkspace('ws-1');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'Workspace not found.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(enforceWorkspaceAccess).toHaveBeenCalledWith('user-123', 'ws-1');
    expect(Workspace.findById).toHaveBeenCalledWith('ws-1');
  });

  it('should return error when trying to delete the active workspace', async () => {
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
      activeWorkspaceId: 'ws-1', // Active workspace is the one being deleted
    });

    // Mock enforceWorkspaceAccess
    (enforceWorkspaceAccess as jest.Mock).mockResolvedValue(undefined);

    // Mock Workspace.findById
    (Workspace.findById as jest.Mock).mockResolvedValue({
      _id: 'ws-1',
      name: 'Test Workspace',
      organizationId: 'org-123',
      memberIds: ['user-mongo-id'],
    });

    // Call the function
    const result = await deleteWorkspace('ws-1');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'Cannot delete your active workspace. Please switch to another workspace first.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(enforceWorkspaceAccess).toHaveBeenCalledWith('user-123', 'ws-1');
    expect(Workspace.findById).toHaveBeenCalledWith('ws-1');
  });

  it('should return error when trying to delete the only workspace', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock User.findOne
    (User.findOne as jest.Mock).mockResolvedValue({
      _id: 'user-mongo-id',
      supabaseUserId: 'user-123',
      organizationId: 'org-123',
      workspaceIds: ['ws-1'], // Only one workspace
      activeWorkspaceId: 'ws-2',
    });

    // Mock enforceWorkspaceAccess
    (enforceWorkspaceAccess as jest.Mock).mockResolvedValue(undefined);

    // Mock Workspace.findById
    (Workspace.findById as jest.Mock).mockResolvedValue({
      _id: 'ws-1',
      name: 'Test Workspace',
      organizationId: 'org-123',
      memberIds: ['user-mongo-id'],
    });

    // Call the function
    const result = await deleteWorkspace('ws-1');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'Cannot delete your only workspace. Please create another workspace first.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(enforceWorkspaceAccess).toHaveBeenCalledWith('user-123', 'ws-1');
    expect(Workspace.findById).toHaveBeenCalledWith('ws-1');
  });

  it('should handle errors', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock connectDB to throw an error
    (connectDB as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

    // Call the function
    const result = await deleteWorkspace('ws-1');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'Failed to delete workspace due to a server error.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });
});
