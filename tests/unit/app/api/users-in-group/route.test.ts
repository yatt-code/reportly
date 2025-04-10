// Mock NextRequest before importing
class MockNextRequest {
  constructor(public url: string) {}
}

// Mock NextResponse before importing
class MockNextResponse {
  static json(body: any, init?: any) {
    return {
      status: init?.status || 200,
      json: async () => body,
    };
  }
}

// Mock the imports
jest.mock('next/server', () => ({
  NextRequest: MockNextRequest,
  NextResponse: MockNextResponse,
}));

import { GET } from '@/app/api/users-in-group/route';
import connectDB from '@/lib/db/connectDB';
import UserModel from '@/models/User';
import logger from '@/lib/utils/logger';

// Mock dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({ value: 'mock-cookie' }),
  }),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn().mockReturnValue({
    auth: {
      getUser: jest.fn(),
    },
  }),
}));

jest.mock('@/lib/db/connectDB', () => jest.fn());

jest.mock('@/models/User', () => ({
  findOne: jest.fn(),
  find: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('GET /api/users-in-group', () => {
  // Mock environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return users from the same group as the authenticated user', async () => {
    // Mock authenticated user
    const mockUser = { id: 'user1' };
    const mockSupabase = require('@supabase/ssr').createServerClient();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock user profile with group
    const mockUserProfile = {
      supabaseUserId: 'user1',
      groupId: 'group1',
    };
    (UserModel.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockUserProfile),
    });

    // Mock users in the same group
    const mockGroupUsers = [
      { supabaseUserId: 'user1', username: 'user1', name: 'User One' },
      { supabaseUserId: 'user2', username: 'user2', name: 'User Two' },
      { supabaseUserId: 'user3', username: 'user3', name: 'User Three' },
    ];
    (UserModel.find as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockGroupUsers),
    });

    // Create a mock request
    const request = new MockNextRequest('http://localhost/api/users-in-group');

    // Call the handler
    const response = await GET(request);
    const responseData = await response.json();

    // Verify database connection was established
    expect(connectDB).toHaveBeenCalled();

    // Verify user profile was fetched with the correct ID
    expect(UserModel.findOne).toHaveBeenCalledWith({ supabaseUserId: 'user1' });

    // Verify users were fetched from the correct group
    expect(UserModel.find).toHaveBeenCalledWith(
      { groupId: 'group1' },
      expect.objectContaining({
        supabaseUserId: 1,
        username: 1,
        name: 1,
        _id: 0,
      })
    );

    // Verify response contains the expected users
    expect(response.status).toBe(200);
    expect(responseData).toEqual({
      users: [
        { id: 'user1', username: 'user1', name: 'User One' },
        { id: 'user2', username: 'user2', name: 'User Two' },
        { id: 'user3', username: 'user3', name: 'User Three' },
      ],
    });
  });

  it('should return empty array when user has no group', async () => {
    // Mock authenticated user
    const mockUser = { id: 'user1' };
    const mockSupabase = require('@supabase/ssr').createServerClient();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock user profile with no group
    const mockUserProfile = {
      supabaseUserId: 'user1',
      // No groupId
    };
    (UserModel.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockUserProfile),
    });

    // Create a mock request
    const request = new MockNextRequest('http://localhost/api/users-in-group');

    // Call the handler
    const response = await GET(request);
    const responseData = await response.json();

    // Verify response contains empty users array
    expect(response.status).toBe(200);
    expect(responseData).toEqual({ users: [] });

    // Verify users were not fetched
    expect(UserModel.find).not.toHaveBeenCalled();
  });

  it('should return 401 when user is not authenticated', async () => {
    // Mock unauthenticated user
    const mockSupabase = require('@supabase/ssr').createServerClient();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    // Create a mock request
    const request = new MockNextRequest('http://localhost/api/users-in-group');

    // Call the handler
    const response = await GET(request);
    const responseData = await response.json();

    // Verify response is unauthorized
    expect(response.status).toBe(401);
    expect(responseData).toEqual({ error: 'Authentication required.' });

    // Verify database was not accessed
    expect(connectDB).not.toHaveBeenCalled();
    expect(UserModel.findOne).not.toHaveBeenCalled();
    expect(UserModel.find).not.toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    // Mock authenticated user
    const mockUser = { id: 'user1' };
    const mockSupabase = require('@supabase/ssr').createServerClient();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock database connection error
    const mockError = new Error('Database connection failed');
    (connectDB as jest.Mock).mockRejectedValue(mockError);

    // Create a mock request
    const request = new MockNextRequest('http://localhost/api/users-in-group');

    // Call the handler
    const response = await GET(request);
    const responseData = await response.json();

    // Verify response contains error
    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: 'Failed to fetch users due to a server error.' });

    // Verify error was logged
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching users in group'),
      mockError
    );
  });
});
