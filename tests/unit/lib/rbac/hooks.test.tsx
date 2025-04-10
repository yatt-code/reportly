import { renderHook } from '@testing-library/react';
import { useUserRole, useHasRole } from '@/lib/rbac/hooks';
import { useUser } from '@/lib/useUser';

// Mock the useUser hook
jest.mock('@/lib/useUser', () => ({
  useUser: jest.fn()
}));

describe('RBAC Hooks', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useUserRole', () => {
    it('should return the user role when available', () => {
      // Mock useUser to return a user with admin role
      (useUser as jest.Mock).mockReturnValue({
        user: { user_metadata: { role: 'admin' } },
        isLoading: false
      });

      const { result } = renderHook(() => useUserRole());
      expect(result.current).toBe('admin');

      // Mock useUser to return a user with developer role
      (useUser as jest.Mock).mockReturnValue({
        user: { user_metadata: { role: 'developer' } },
        isLoading: false
      });

      const { result: developerResult } = renderHook(() => useUserRole());
      expect(developerResult.current).toBe('developer');
    });

    it('should return null when user is loading', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        isLoading: true
      });

      const { result } = renderHook(() => useUserRole());
      expect(result.current).toBeNull();
    });

    it('should return null when user is not authenticated', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        isLoading: false
      });

      const { result } = renderHook(() => useUserRole());
      expect(result.current).toBeNull();
    });

    it('should return null when role is missing', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: { user_metadata: {} },
        isLoading: false
      });

      const { result } = renderHook(() => useUserRole());
      expect(result.current).toBeNull();
    });
  });

  describe('useHasRole', () => {
    it('should return true when user has the required role', () => {
      // Mock useUser to return a user with admin role
      (useUser as jest.Mock).mockReturnValue({
        user: { user_metadata: { role: 'admin' } },
        isLoading: false
      });

      const { result } = renderHook(() => useHasRole('admin'));
      expect(result.current).toBe(true);
    });

    it('should return true when user role is in the array of required roles', () => {
      // Mock useUser to return a user with developer role
      (useUser as jest.Mock).mockReturnValue({
        user: { user_metadata: { role: 'developer' } },
        isLoading: false
      });

      const { result } = renderHook(() => useHasRole(['admin', 'developer']));
      expect(result.current).toBe(true);
    });

    it('should return false when user does not have the required role', () => {
      // Mock useUser to return a user with developer role
      (useUser as jest.Mock).mockReturnValue({
        user: { user_metadata: { role: 'developer' } },
        isLoading: false
      });

      const { result } = renderHook(() => useHasRole('admin'));
      expect(result.current).toBe(false);
    });

    it('should return false when user is loading', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        isLoading: true
      });

      const { result } = renderHook(() => useHasRole('admin'));
      expect(result.current).toBe(false);
    });

    it('should return false when user is not authenticated', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: null,
        isLoading: false
      });

      const { result } = renderHook(() => useHasRole('admin'));
      expect(result.current).toBe(false);
    });

    it('should return false when role is missing', () => {
      (useUser as jest.Mock).mockReturnValue({
        user: { user_metadata: {} },
        isLoading: false
      });

      const { result } = renderHook(() => useHasRole('admin'));
      expect(result.current).toBe(false);
    });
  });
});
