import { getOrganization } from '@/app/actions/organization/getOrganization';
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
    countDocuments: jest.fn(),
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

describe('getOrganization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return organization data when user has an organization', async () => {
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
    (Organization.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'org-123',
        name: 'Test Organization',
        ownerId: 'user-mongo-id',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      }),
    });

    // Mock User.countDocuments
    (User.countDocuments as jest.Mock).mockResolvedValue(5);

    // Call the function
    const result = await getOrganization();

    // Check the result
    expect(result).toEqual({
      success: true,
      data: {
        id: 'org-123',
        name: 'Test Organization',
        ownerId: 'user-mongo-id',
        memberCount: 5,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(Organization.findById).toHaveBeenCalledWith('org-123');
    expect(User.countDocuments).toHaveBeenCalledWith({ organizationId: 'org-123' });
  });

  it('should return error when user is not authenticated', async () => {
    // Mock getCurrentUser to return null
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    // Call the function
    const result = await getOrganization();

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
    const result = await getOrganization();

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
    const result = await getOrganization();

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
    (Organization.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    // Call the function
    const result = await getOrganization();

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
    const result = await getOrganization();

    // Check the result
    expect(result).toEqual({
      success: false,
      error: 'Failed to get organization due to a server error.',
    });

    // Check that the dependencies were called
    expect(getCurrentUser).toHaveBeenCalled();
    expect(connectDB).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });
});
