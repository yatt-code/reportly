import { render } from '@testing-library/react';
import AdminUsersPage from '@/app/admin/users/page';
import { getCurrentUser } from '@/lib/auth';
import { hasRole } from '@/lib/rbac/utils';
import { redirect } from 'next/navigation';

// Mock dependencies
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn()
}));

jest.mock('@/lib/rbac/utils', () => ({
  hasRole: jest.fn()
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}));

jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('AdminUsersPage', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the admin page for admin users', async () => {
    // Mock an admin user
    const adminUser = {
      id: 'admin-user-id',
      user_metadata: { role: 'admin' }
    };

    // Setup mocks to allow access
    (getCurrentUser as jest.Mock).mockResolvedValue(adminUser);
    (hasRole as jest.Mock).mockReturnValue(true);

    // Render the page (need to await since it's a server component)
    const page = await AdminUsersPage();
    const { container } = render(page);

    // Check that the page rendered (contains the heading)
    expect(container.textContent).toContain('Manage Users (Admin)');

    // Verify redirect was not called
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should redirect non-admin users to dashboard', async () => {
    // Mock a developer user
    const developerUser = {
      id: 'developer-user-id',
      user_metadata: { role: 'developer' }
    };

    // Setup mocks to deny access
    (getCurrentUser as jest.Mock).mockResolvedValue(developerUser);
    (hasRole as jest.Mock).mockReturnValue(false);

    try {
      // Call the page component
      await AdminUsersPage();
      // If we get here, the test should fail because redirect should have been called
      fail('Expected redirect to be called');
    } catch (error) {
      // Expected behavior - redirect throws an error in tests
    }

    // Verify redirect was called with the correct path
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect unauthenticated users to dashboard', async () => {
    // Mock no user
    (getCurrentUser as jest.Mock).mockResolvedValue(null);
    (hasRole as jest.Mock).mockReturnValue(false);

    try {
      // Call the page component
      await AdminUsersPage();
      // If we get here, the test should fail because redirect should have been called
      fail('Expected redirect to be called');
    } catch (error) {
      // Expected behavior - redirect throws an error in tests
    }

    // Verify redirect was called with the correct path
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });
});
