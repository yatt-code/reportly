import { createWorkspace } from '@/app/actions/workspace/createWorkspace';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db/connectDB';
import User from '@/models/User';
import { Workspace } from '@/models/Workspace';
import { Organization } from '@/models/Organization';
import logger from '@/lib/utils/logger';

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
  Workspace: jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({ _id: 'workspace-123' }),
  })),
}));

jest.mock('@/models/Organization', () => ({
  __esModule: true,
  Organization: {
    findById: jest.fn(),
  },
}));

jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('createWorkspace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a workspace when all conditions are met', async () => {
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
      workspaceIds: ['existing-workspace-id'],
      save: mockUserSave,
    });

    // Mock Organization.findById
    (Organization.findById as jest.Mock).mockResolvedValue({
      _id: 'org-123',
      name: 'Test Organization',
      ownerId: 'user-mongo-id',
    });

    // Mock Workspace constructor
    const mockWorkspaceSave = jest.fn().mockResolvedValue({
      _id: 'workspace-123',
    });
    (Workspace as jest.Mock).mockImplementation(() => ({
      _id: 'workspace-123',
      save: mockWorkspaceSave,
    }));

    // Call the function
    const result = await createWorkspace('New Workspace', 'team');

    // Check the result
    expect(result).toEqual({
      success: true,
      workspaceId: 'workspace-123',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(Organization.findById).toHaveBeenCalledWith('org-123');
    expect(Workspace).toHaveBeenCalledWith({
      name: 'New Workspace',
      organizationId: 'org-123',
      type: 'team',
      memberIds: ['user-mongo-id'],
    });
    expect(mockWorkspaceSave).toHaveBeenCalled();
    expect(mockUserSave).toHaveBeenCalled();
  });

  it('should return error when workspace name is empty', async () => {
    // Call the function with empty name
    const result = await createWorkspace('', 'team');

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
    const result = await createWorkspace('New Workspace', 'team');

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
    const result = await createWorkspace('New Workspace', 'team');

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

  it('should return error when user has no organization', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock User.findOne
    (User.findOne as jest.Mock).mockResolvedValue({
      _id: 'user-mongo-id',
      supabaseUserId: 'user-123',
      // No organizationId
    });

    // Call the function
    const result = await createWorkspace('New Workspace', 'team');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'User has no organization. Please create an organization first.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
  });

  it('should return error when organization is not found', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock User.findOne
    (User.findOne as jest.Mock).mockResolvedValue({
      _id: 'user-mongo-id',
      supabaseUserId: 'user-123',
      organizationId: 'org-123',
    });

    // Mock Organization.findById to return null
    (Organization.findById as jest.Mock).mockResolvedValue(null);

    // Call the function
    const result = await createWorkspace('New Workspace', 'team');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'Organization not found.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(Organization.findById).toHaveBeenCalledWith('org-123');
  });

  it('should handle errors', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock connectDB to throw an error
    (connectDB as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

    // Call the function
    const result = await createWorkspace('New Workspace', 'team');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'Failed to create workspace due to a server error.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });
});
