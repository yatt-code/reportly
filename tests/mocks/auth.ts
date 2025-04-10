/**
 * Mock authentication utilities for testing
 */

// Mock getCurrentUser function
export const getCurrentUser = jest.fn().mockResolvedValue({
  id: 'mock-user-id',
  email: 'test@example.com',
  name: 'Test User',
});

// Mock createServerClient function
export const createServerClient = jest.fn().mockReturnValue({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: {
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
        },
      },
      error: null,
    }),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation((callback) => {
      return Promise.resolve(callback({ data: [], error: null }));
    }),
  }),
});

// Mock useUser hook
export const useUser = jest.fn().mockReturnValue({
  user: {
    id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  isAuthenticated: true,
  isLoading: false,
});
