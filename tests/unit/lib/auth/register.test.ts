import { register } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabaseClient';

// Mock dependencies
jest.mock('@/lib/supabaseClient');
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('register', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should assign the default role "developer" on signup', async () => {
    // Mock Supabase client and auth.signUp response
    const mockSignUp = jest.fn().mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: { role: 'developer' }
        },
        session: {}
      },
      error: null
    });

    const mockSupabase = {
      auth: {
        signUp: mockSignUp
      }
    };

    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    // Call the register function
    const result = await register({
      email: 'test@example.com',
      password: 'password123'
    });

    // Verify the result
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data?.user?.id).toBe('test-user-id');

    // Verify Supabase signUp was called with the correct parameters
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          role: 'developer' // Verify the default role is set
        }
      }
    });
  });

  it('should validate email and password format', async () => {
    // Call with invalid email
    const invalidEmailResult = await register({
      email: 'invalid-email',
      password: 'password123'
    });

    expect(invalidEmailResult.error).toBeDefined();
    expect(invalidEmailResult.error?.message).toContain('Invalid email');

    // Call with short password
    const shortPasswordResult = await register({
      email: 'test@example.com',
      password: '12345'
    });

    expect(shortPasswordResult.error).toBeDefined();
    expect(shortPasswordResult.error?.message).toContain('Invalid email or password format');
  });

  it('should handle Supabase registration errors', async () => {
    // Mock Supabase error response
    const mockSignUp = jest.fn().mockResolvedValue({
      data: null,
      error: {
        message: 'Email already registered'
      }
    });

    const mockSupabase = {
      auth: {
        signUp: mockSignUp
      }
    };

    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

    // Call the register function
    const result = await register({
      email: 'existing@example.com',
      password: 'password123'
    });

    // Verify the error is returned
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBe('Email already registered');
  });
});
