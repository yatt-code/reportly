import { getOrganization } from '@/app/actions/organization/getOrganization';
import { getCurrentUser } from '@/lib/auth.server'; // Corrected import path
import connectDB from '@/lib/db/connectDB';
import UserModel from '@/models/User'; // Use default import alias
import { Organization as OrganizationModel } from '@/models/Organization'; // Use named import alias
import logger from '@/lib/utils/logger';

// Mock dependencies
// Removed local mock for auth.server - now handled globally in setup.js
// We still need to import it to override the mock in specific tests
import { getCurrentUser } from '@/lib/auth.server';

jest.mock('@/lib/db/connectDB', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock the default export for User model
jest.mock('@/models/User');
const MockUserModel = {
    findOne: jest.fn(),
    countDocuments: jest.fn(),
};
(UserModel as jest.Mock).mockImplementation(() => MockUserModel);
// Also mock the static methods directly if needed by tests
(UserModel.findOne as jest.Mock) = MockUserModel.findOne;
(UserModel.countDocuments as jest.Mock) = MockUserModel.countDocuments;

// Mock the named export for Organization model
jest.mock('@/models/Organization', () => ({
  Organization: {
    findById: jest.fn(),
  }
}));
const MockOrganizationModel = {
    findById: jest.fn(),
};
// Assign mock methods if OrganizationModel alias is used directly in tests
(OrganizationModel.findById as jest.Mock) = MockOrganizationModel.findById;


jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('getOrganization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations for models
    MockUserModel.findOne.mockReset();
    MockUserModel.countDocuments.mockReset();
    MockOrganizationModel.findById.mockReset();
  });

  it('should return organization data when user has an organization', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock User.findOne
    MockUserModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'user-mongo-id',
        supabaseUserId: 'user-123',
        organizationId: 'org-123',
        // Add other fields from UserDocument if needed by the action
      }),
    });

    // Mock Organization.findById
    MockOrganizationModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'org-123',
        name: 'Test Organization',
        ownerId: 'user-mongo-id', // Ensure this matches OrganizationDocument if used
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        // Add other fields from OrganizationDocument if needed
      }),
    });

    // Mock User.countDocuments
    MockUserModel.countDocuments.mockResolvedValue(5);

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
    expect(MockUserModel.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(MockOrganizationModel.findById).toHaveBeenCalledWith('org-123');
    expect(MockUserModel.countDocuments).toHaveBeenCalledWith({ organizationId: 'org-123' });
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
    MockUserModel.findOne.mockReturnValue({
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
    expect(MockUserModel.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
  });

  it('should return error when user has no organization', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock User.findOne
    MockUserModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'user-mongo-id',
        supabaseUserId: 'user-123',
        // organizationId is missing or null/undefined
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
    expect(MockUserModel.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
  });

  it('should return error when organization is not found', async () => {
    // Mock getCurrentUser
    (getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
    });

    // Mock User.findOne
    MockUserModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'user-mongo-id',
        supabaseUserId: 'user-123',
        organizationId: 'org-123',
      }),
    });

    // Mock Organization.findById to return null
    MockOrganizationModel.findById.mockReturnValue({
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
    expect(MockUserModel.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user-123' });
    expect(MockOrganizationModel.findById).toHaveBeenCalledWith('org-123');
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
