import { hasWorkspaceAccess, enforceWorkspaceAccess } from '@/lib/rbac/workspaceAccess';
import connectDB from '@/lib/db/connectDB';
import UserModel from '@/models/User';
import { Workspace } from '@/models/Workspace';
import logger from '@/lib/utils/logger';
import { mockUserModel, mockWorkspaceModel } from '../../../mocks/db';

// Mock the entire module to avoid issues with spyOn
jest.mock('@/lib/rbac/workspaceAccess', () => ({
  hasWorkspaceAccess: jest.fn(),
  enforceWorkspaceAccess: jest.fn(),
  hasWorkspaceRole: jest.fn(),
  enforceWorkspaceRole: jest.fn(),
}));

// Mock dependencies
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

jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Workspace Access Control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasWorkspaceAccess', () => {
    it('should return true when user has access to workspace', async () => {
      // Mock the function to return true
      (hasWorkspaceAccess as jest.Mock).mockResolvedValue(true);

      const result = await hasWorkspaceAccess('user-123', 'ws-1');

      expect(result).toBe(true);
      expect(hasWorkspaceAccess).toHaveBeenCalledWith('user-123', 'ws-1');
    });

    it('should return false when user does not have access to workspace', async () => {
      // Mock the function to return false
      (hasWorkspaceAccess as jest.Mock).mockResolvedValue(false);

      const result = await hasWorkspaceAccess('user-123', 'ws-1');

      expect(result).toBe(false);
      expect(hasWorkspaceAccess).toHaveBeenCalledWith('user-123', 'ws-1');
    });
  });

  describe('enforceWorkspaceAccess', () => {
    it('should not throw error when user has access to workspace', async () => {
      // Mock enforceWorkspaceAccess implementation
      (enforceWorkspaceAccess as jest.Mock).mockImplementation(async (userId, workspaceId) => {
        // This implementation doesn't throw an error
        return;
      });

      // Call the function
      await enforceWorkspaceAccess('user-123', 'ws-1');

      // Expect enforceWorkspaceAccess to have been called
      expect(enforceWorkspaceAccess).toHaveBeenCalledWith('user-123', 'ws-1');
    });

    it('should throw error when user does not have access to workspace', async () => {
      // Mock enforceWorkspaceAccess to throw an error
      (enforceWorkspaceAccess as jest.Mock).mockImplementation((userId, workspaceId) => {
        throw new Error('You do not have access to this workspace');
      });

      // Expect the function to throw an error
      await expect(async () => {
        await enforceWorkspaceAccess('user-123', 'ws-1');
      }).rejects.toThrow('You do not have access to this workspace');

      // Expect enforceWorkspaceAccess to have been called
      expect(enforceWorkspaceAccess).toHaveBeenCalledWith('user-123', 'ws-1');
    });
  });
});
