# 🧪 Authentication & Authorization Manual Tests

This directory contains manual test scripts for authentication and authorization features of the Reportly application.

## Available Test Scripts

- [Auth & RBAC Tests](auth-rbac-tests.md) - Tests for authentication and role-based access control

## Test Coverage

### Auth & RBAC Tests

The authentication and RBAC tests cover:
- User registration flow
- Login and logout functionality
- Password reset process
- Session management and persistence
- Role-based access control for different user types
- Permission enforcement for protected resources
- Error handling for unauthorized access attempts

## Running Auth Tests

When running authentication tests:

1. Use test user accounts (never production credentials)
2. Test both positive and negative scenarios
3. Verify proper error messages for invalid inputs
4. Check session persistence across page refreshes
5. Test role-based UI differences
6. Verify security measures like CSRF protection

## Reporting Issues

When reporting authentication issues, include:

1. User role and permissions
2. Steps to reproduce
3. Expected vs. actual behavior
4. Any error messages displayed
5. Browser and device information
