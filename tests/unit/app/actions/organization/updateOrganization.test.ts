import { updateOrganization } from '@/app/actions/organization/updateOrganization';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db/connectDB';
import User from '@/models/User';
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

describe('updateOrganization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update organization name when user is the owner', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock User.findOne
    (User.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'user-mongo-id',
        supabaseUserId: 'user-123',
        organizationId: 'org-123',
      }),
    });

    // Mock Organization.findById
    const mockSave = jest.fn().mockResolvedValue(undefined);
    (Organization.findById as jest.Mock).mockResolvedValue({
      _id: 'org-123',
      name: 'Old Organization Name',
      ownerId: 'user-mongo-id',
      save: mockSave,
    });

    // Call the function
    const result = await updateOrganization('New Organization Name');

    // Check the result
    expect(result).toEqual({
      success: true,
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(Organization.findById).toHaveBeenCalledWith('org-123');
    expect(mockSave).toHaveBeenCalled();
  });

  it('should return error when organization name is empty', async () => {
    // Call the function with empty name
    const result = await updateOrganization('');

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
    const result = await updateOrganization('New Organization Name');

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
    (User.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    // Call the function
    const result = await updateOrganization('New Organization Name');

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
    (User.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'user-mongo-id',
        supabaseUserId: 'user-123',
        // No organizationId
      }),
    });

    // Call the function
    const result = await updateOrganization('New Organization Name');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'User has no organization.',
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
    (User.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'user-mongo-id',
        supabaseUserId: 'user-123',
        organizationId: 'org-123',
      }),
    });

    // Mock Organization.findById to return null
    (Organization.findById as jest.Mock).mockResolvedValue(null);

    // Call the function
    const result = await updateOrganization('New Organization Name');

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

  it('should return error when user is not the owner of the organization', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock User.findOne
    (User.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'user-mongo-id',
        supabaseUserId: 'user-123',
        organizationId: 'org-123',
      }),
    });

    // Mock Organization.findById with different owner
    (Organization.findById as jest.Mock).mockResolvedValue({
      _id: 'org-123',
      name: 'Old Organization Name',
      ownerId: 'different-user-id', // Different owner
    });

    // Call the function
    const result = await updateOrganization('New Organization Name');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'Only the organization owner can update the organization.',
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
    const result = await updateOrganization('New Organization Name');

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'Failed to update organization due to a server error.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });
});
