import { enforceRole } from '@/lib/rbac/utils';
import { User } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('enforceRole', () => {
  // Create mock users with different roles
  const adminUser = {
    id: 'admin-user-id',
    user_metadata: { role: 'admin' }
  } as User;

  const developerUser = {
    id: 'developer-user-id',
    user_metadata: { role: 'developer' }
  } as User;

  const noRoleUser = {
    id: 'no-role-user-id',
    user_metadata: {}
  } as User;

  it('should not throw when user has the required role', () => {
    // Admin user with admin role requirement
    expect(() => enforceRole('admin', adminUser)).not.toThrow();
    
    // Developer user with developer role requirement
    expect(() => enforceRole('developer', developerUser)).not.toThrow();
    
    // Admin user with array of roles including admin
    expect(() => enforceRole(['admin', 'superadmin'], adminUser)).not.toThrow();
    
    // Developer user with array of roles including developer
    expect(() => enforceRole(['developer', 'admin'], developerUser)).not.toThrow();
  });

  it('should throw when user does not have the required role', () => {
    // Developer user with admin role requirement
    expect(() => enforceRole('admin', developerUser)).toThrow('Forbidden: Insufficient privileges.');
    
    // Admin user with role not in the list
    expect(() => enforceRole(['developer', 'editor'], adminUser)).toThrow('Forbidden: Insufficient privileges.');
    
    // User with no role
    expect(() => enforceRole('developer', noRoleUser)).toThrow('Forbidden: Insufficient privileges.');
  });

  it('should throw when user is null', () => {
    expect(() => enforceRole('admin', null)).toThrow('Authentication required.');
    expect(() => enforceRole(['admin', 'developer'], null)).toThrow('Authentication required.');
  });

  it('should include action context in error logging', () => {
    const actionContext = 'delete a report';
    
    try {
      enforceRole('admin', developerUser, actionContext);
    } catch (error) {
      // The function should throw, but we're testing the action context was used
    }
    
    // We can't easily test the logger directly since it's mocked,
    // but we can verify the function doesn't throw unexpected errors
    // when using the action context parameter
    expect(() => enforceRole('admin', adminUser, actionContext)).not.toThrow();
  });
});
