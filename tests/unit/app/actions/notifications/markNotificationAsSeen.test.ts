import { markNotificationAsSeen } from '@/app/actions/notifications/markNotificationAsSeen';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import logger from '@/lib/utils/logger';

// --- Mocks ---
// Mock next/headers cookies function
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock @supabase/ssr
const mockSupabaseUpdate = jest.fn().mockReturnThis(); // Make methods chainable
const mockSupabaseEqId = jest.fn().mockReturnThis();
const mockSupabaseEqUserId = jest.fn(); // This is the final call in the chain
const mockGetUser = jest.fn();
const mockSupabaseClient = {
  from: jest.fn(() => ({
    update: mockSupabaseUpdate,
  })),
  auth: {
    getUser: mockGetUser,
  },
};
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => mockSupabaseClient),
}));

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock cookie store behavior
const mockCookieStore = {
  get: jest.fn(),
};
(cookies as jest.Mock).mockReturnValue(mockCookieStore);
// --- End Mocks ---

describe('markNotificationAsSeen Server Action', () => {
  // Use a valid UUID format for the notification ID
  const mockNotificationId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = 'user-uuid-123';
  const mockUser = { id: mockUserId };

  // Mock environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Reset mock implementations if needed
    mockSupabaseUpdate.mockReturnThis();
    mockSupabaseEqId.mockReturnThis();
    mockSupabaseEqUserId.mockReset();
    mockGetUser.mockReset();

    // Setup environment variables
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
    };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should mark a notification as seen successfully', async () => {
    // Setup mock implementations
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSupabaseUpdate.mockImplementation(() => ({
      eq: mockSupabaseEqId.mockImplementation(() => ({
        eq: mockSupabaseEqUserId.mockResolvedValue({ error: null })
      }))
    }));

    const result = await markNotificationAsSeen(mockNotificationId);

    expect(result.success).toBe(true);
    expect(createServerClient).toHaveBeenCalled();
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('notifications');
    expect(mockSupabaseUpdate).toHaveBeenCalledWith({ seen: true });
    expect(mockSupabaseEqId).toHaveBeenCalledWith('id', mockNotificationId);
    expect(mockSupabaseEqUserId).toHaveBeenCalledWith('userId', mockUserId);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should return authentication error if user is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await markNotificationAsSeen(mockNotificationId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Authentication required.');
    expect(mockSupabaseClient.from).not.toHaveBeenCalled();
  });

  it('should return validation error for invalid notification ID', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const result = await markNotificationAsSeen('invalid-id'); // Not a UUID format

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid Notification ID format.');
    expect(result.issues).toBeDefined();
    expect(mockSupabaseClient.from).not.toHaveBeenCalled();
  });

  it('should handle Supabase update errors', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSupabaseUpdate.mockImplementation(() => ({
      eq: mockSupabaseEqId.mockImplementation(() => ({
        eq: mockSupabaseEqUserId.mockResolvedValue({ error: new Error('Supabase error') })
      }))
    }));

    const result = await markNotificationAsSeen(mockNotificationId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to mark notification as seen due to a server error.');
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle RLS policy violations', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    const rlsError = new Error('violates row-level security policy');
    mockSupabaseUpdate.mockImplementation(() => ({
      eq: mockSupabaseEqId.mockImplementation(() => ({
        eq: mockSupabaseEqUserId.mockRejectedValue(rlsError)
      }))
    }));

    const result = await markNotificationAsSeen(mockNotificationId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Forbidden: Cannot update this notification.');
    expect(logger.error).toHaveBeenCalled();
  });
});
