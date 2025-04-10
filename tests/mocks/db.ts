/**
 * Mock database utilities for testing
 */

// Mock connectDB function
export const connectDB = jest.fn().mockResolvedValue(undefined);

// Mock mongoose models
export const mockUserModel = {
  findOne: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  lean: jest.fn().mockReturnThis(),
  save: jest.fn(),
  updateMany: jest.fn(),
};

export const mockOrganizationModel = {
  findById: jest.fn(),
  find: jest.fn(),
  lean: jest.fn().mockReturnThis(),
  save: jest.fn(),
};

export const mockWorkspaceModel = {
  findById: jest.fn(),
  find: jest.fn(),
  lean: jest.fn().mockReturnThis(),
  save: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

export const mockReportModel = {
  findById: jest.fn(),
  find: jest.fn(),
  lean: jest.fn().mockReturnThis(),
  save: jest.fn(),
  deleteMany: jest.fn(),
};

export const mockCommentModel = {
  findById: jest.fn(),
  find: jest.fn(),
  lean: jest.fn().mockReturnThis(),
  save: jest.fn(),
  deleteMany: jest.fn(),
};
