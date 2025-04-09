import { getNotifications } from '@/app/actions/notifications/getNotifications';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import logger from '@/lib/utils/logger';

// --- Mocks ---
// Mock next/headers cookies function
jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}));

// Mock @supabase/ssr
const mockSupabaseSelect = jest.fn().mockReturnThis(); // Make methods chainable
const mockSupabaseEqUserId = jest.fn().mockReturnThis();
const mockSupabaseEqSeen = jest.fn().mockReturnThis();
const mockSupabaseOrder = jest.fn(); // This is the final call in the chain
const mockGetUser = jest.fn();
const mockSupabaseClient = {
    from: jest.fn(() => ({
        select: mockSupabaseSelect,
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
    // set/remove not needed for getNotifications test
};
(cookies as jest.Mock).mockReturnValue(mockCookieStore);
// --- End Mocks ---


describe('getNotifications Server Action', () => {

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        // Reset mock implementations if needed
        mockSupabaseSelect.mockReturnThis();
        mockSupabaseEqUserId.mockReturnThis();
        mockSupabaseEqSeen.mockReturnThis();
        mockSupabaseOrder.mockReset(); // Reset the final call mock
        mockGetUser.mockReset();
    });

    it('should return notifications successfully for an authenticated user', async () => {
        const mockUserId = 'user-uuid-123';
        const mockUser = { id: mockUserId, /* other user props */ };
        const mockRawNotifications = [
            { id: 'uuid-1', userId: mockUserId, type: 'mention', contextId: 'comment-1', reportId: 'report-1', seen: false, createdAt: new Date().toISOString(), comment: [{ content: 'Mention 1' }], report: [{ title: 'Report A' }] },
            { id: 'uuid-2', userId: mockUserId, type: 'reply', contextId: 'comment-2', reportId: 'report-2', seen: false, createdAt: new Date().toISOString(), comment: [{ content: 'Reply 1' }], report: [{ title: 'Report B' }] },
        ];
        const expectedMappedNotifications = [
             { id: 'uuid-1', userId: mockUserId, type: 'mention', contextId: 'comment-1', reportId: 'report-1', seen: false, createdAt: expect.any(String), comment: { content: 'Mention 1' }, report: { title: 'Report A' } },
             { id: 'uuid-2', userId: mockUserId, type: 'reply', contextId: 'comment-2', reportId: 'report-2', seen: false, createdAt: expect.any(String), comment: { content: 'Reply 1' }, report: { title: 'Report B' } },
        ];

        // Setup mock implementations
        mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
        mockSupabaseSelect.mockImplementation(() => ({ // Need to return the chainable object
             eq: mockSupabaseEqUserId.mockImplementation(() => ({
                 eq: mockSupabaseEqSeen.mockImplementation(() => ({
                     order: mockSupabaseOrder.mockResolvedValue({ data: mockRawNotifications, error: null })
                 }))
             }))
        }));


        const result = await getNotifications();

        expect(result.success).toBe(true);
        // Use expect.any(String) for createdAt as exact value is hard to match
        expect((result as any).notifications).toEqual(expectedMappedNotifications);
        expect(createServerClient).toHaveBeenCalled();
        expect(mockGetUser).toHaveBeenCalledTimes(1);
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('notifications');
        expect(mockSupabaseSelect).toHaveBeenCalledWith(expect.stringContaining('comment: comments ( content )'));
        expect(mockSupabaseEqUserId).toHaveBeenCalledWith('userId', mockUserId);
        expect(mockSupabaseEqSeen).toHaveBeenCalledWith('seen', false);
        expect(mockSupabaseOrder).toHaveBeenCalledWith('createdAt', { ascending: false });
        expect(logger.error).not.toHaveBeenCalled();
    });

    it('should return authentication error if user is not found', async () => {
        mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

        const result = await getNotifications();

        expect(result.success).toBe(false);
        expect((result as any).error).toBe('Authentication required.');
        expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

     it('should return authentication error if getUser throws', async () => {
        const authError = new Error('Supabase auth error');
        mockGetUser.mockResolvedValue({ data: { user: null }, error: authError });

        const result = await getNotifications();

        expect(result.success).toBe(false);
        expect((result as any).error).toBe('Authentication required.');
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Authentication failed'), authError);
    });

    it('should return fetch error if Supabase query fails', async () => {
        const mockUserId = 'user-uuid-123';
        const mockUser = { id: mockUserId };
        const dbError = new Error('DB connection failed');

        mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
        mockSupabaseSelect.mockImplementation(() => ({
             eq: mockSupabaseEqUserId.mockImplementation(() => ({
                 eq: mockSupabaseEqSeen.mockImplementation(() => ({
                     order: mockSupabaseOrder.mockResolvedValue({ data: null, error: dbError })
                 }))
             }))
        }));

        const result = await getNotifications();

        expect(result.success).toBe(false);
        expect((result as any).error).toBe('Failed to fetch notifications due to a server error.');
        expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error fetching notifications'), dbError);
    });

     it('should return empty array if no notifications found', async () => {
        const mockUserId = 'user-uuid-123';
        const mockUser = { id: mockUserId };

        mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
         mockSupabaseSelect.mockImplementation(() => ({
             eq: mockSupabaseEqUserId.mockImplementation(() => ({
                 eq: mockSupabaseEqSeen.mockImplementation(() => ({
                     order: mockSupabaseOrder.mockResolvedValue({ data: [], error: null }) // Return empty array
                 }))
             }))
        }));

        const result = await getNotifications();

        expect(result.success).toBe(true);
        expect((result as any).notifications).toEqual([]);
    });

});