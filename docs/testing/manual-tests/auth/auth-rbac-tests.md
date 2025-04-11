# Manual Test Script: Authentication & Role-Based Access Control (RBAC)

This document provides step-by-step instructions for manually testing the authentication and role-based access control features of the Reportly application.

## Prerequisites

- A clean browser (or incognito/private window) to avoid session conflicts
- Access to the Reportly application URL
- Access to the Supabase dashboard (for admin tests)

## 1. User Registration

### Test 1.1: New User Registration

**Objective**: Verify that a new user can register successfully with the default 'developer' role.

**Steps**:
1. Navigate to the Reportly application URL
2. Click on "Register" or navigate to `/register`
3. Enter a valid email address (e.g., `test-user@example.com`)
4. Enter a valid password (at least 6 characters)
5. Confirm the password
6. Click the "Create Account" button

**Expected Results**:
- A success message appears
- User is redirected to the dashboard
- The user is assigned the 'developer' role (can be verified in Supabase dashboard)

### Test 1.2: Registration Validation

**Objective**: Verify that registration form validation works correctly.

**Steps**:
1. Navigate to `/register`
2. Test the following scenarios:
   - Submit with an empty email field
   - Submit with an invalid email format (e.g., "notanemail")
   - Submit with a password less than 6 characters
   - Submit with non-matching password confirmation
   - Submit with an email that's already registered

**Expected Results**:
- Appropriate error messages are displayed for each validation failure
- Form is not submitted when validation fails
- User remains on the registration page

## 2. User Login

### Test 2.1: Successful Login

**Objective**: Verify that a registered user can log in successfully.

**Steps**:
1. Navigate to the Reportly application URL
2. Click on "Login" or navigate to `/login`
3. Enter the email and password used during registration
4. Click the "Sign In" button

**Expected Results**:
- A success message appears
- User is redirected to the dashboard
- User's authentication state is maintained across page refreshes

### Test 2.2: Failed Login Attempts

**Objective**: Verify that login validation and error handling work correctly.

**Steps**:
1. Navigate to `/login`
2. Test the following scenarios:
   - Submit with an incorrect email/password combination
   - Submit with an empty email field
   - Submit with an empty password field

**Expected Results**:
- Appropriate error messages are displayed
- User remains on the login page
- No authentication token is set

### Test 2.3: Logout Functionality

**Objective**: Verify that a user can log out successfully.

**Steps**:
1. Log in as a registered user
2. Navigate to the user menu (typically in the top-right corner)
3. Click on "Logout" or "Sign Out"

**Expected Results**:
- User is logged out and redirected to the login page
- Attempting to access protected routes redirects to the login page

## 3. Route Protection

### Test 3.1: Protected Route Access

**Objective**: Verify that unauthenticated users cannot access protected routes.

**Steps**:
1. Open a new browser session (or clear cookies)
2. Attempt to directly access the following URLs:
   - `/dashboard`
   - `/report/new`
   - `/report/any-report-id`

**Expected Results**:
- User is redirected to the login page for each protected route
- After successful login, user is redirected to the originally requested page

### Test 3.2: Public Route Access

**Objective**: Verify that authenticated users are redirected from public routes.

**Steps**:
1. Log in as a registered user
2. Attempt to access the following URLs:
   - `/login`
   - `/register`

**Expected Results**:
- User is redirected to the dashboard instead of seeing login/register pages

## 4. Role-Based Access Control

### Test 4.1: Developer Role Permissions

**Objective**: Verify that users with the 'developer' role have appropriate access.

**Steps**:
1. Log in as a user with the 'developer' role
2. Verify the following:
   - Can access the dashboard
   - Can create new reports
   - Can view, edit, and delete their own reports
   - Cannot access admin-only pages

**Expected Results**:
- All developer-appropriate actions succeed
- Admin-only UI elements are not visible
- Attempting to access `/admin/users` redirects to the dashboard

### Test 4.2: Admin Role Permissions

**Objective**: Verify that users with the 'admin' role have appropriate access.

**Prerequisites**:
- Access to Supabase dashboard to change a user's role to 'admin'
- OR an existing admin account

**Steps**:
1. In Supabase dashboard, locate a test user and change their role to 'admin'
2. Log in as this admin user
3. Verify the following:
   - Can access the dashboard
   - Can create new reports
   - Can view, edit, and delete their own reports
   - Can view all users' reports
   - Can access admin-only pages like `/admin/users`
   - Can delete other users' reports

**Expected Results**:
- All admin-appropriate actions succeed
- Admin-only UI elements are visible
- Can successfully access `/admin/users`

### Test 4.3: Role-Based UI Elements

**Objective**: Verify that UI elements are conditionally rendered based on user role.

**Steps**:
1. Log in as a 'developer' user
2. Note which administrative UI elements are visible/hidden
3. Log out and log in as an 'admin' user
4. Note which administrative UI elements are now visible

**Expected Results**:
- Developer user does not see admin-only UI elements (e.g., admin dashboard link, user management options)
- Admin user sees all UI elements, including admin-specific ones

## 5. Edge Cases

### Test 5.1: Session Persistence

**Objective**: Verify that authentication state persists across page refreshes and browser restarts.

**Steps**:
1. Log in as a registered user
2. Refresh the page
3. Close the browser and reopen it
4. Navigate back to the application URL

**Expected Results**:
- User remains logged in after page refresh
- User remains logged in after browser restart (unless cookies were cleared)

### Test 5.2: Concurrent Sessions

**Objective**: Verify behavior with multiple sessions.

**Steps**:
1. Log in as the same user in two different browsers or devices
2. Make changes in one session (e.g., update profile)
3. Check if changes are reflected in the other session

**Expected Results**:
- Both sessions remain active
- Changes made in one session are visible in the other after refresh

### Test 5.3: Session Timeout

**Objective**: Verify that expired sessions are handled correctly.

**Steps**:
1. Log in as a registered user
2. Wait for the session to expire (may require adjusting Supabase session duration for testing)
3. Attempt to access a protected route

**Expected Results**:
- User is redirected to login page when session expires
- A message indicates that the session has expired

## 6. Security Tests

### Test 6.1: Direct API Access

**Objective**: Verify that API endpoints enforce authentication and authorization.

**Steps**:
1. Log out of the application
2. Using browser developer tools or a tool like Postman, attempt to directly call API endpoints:
   - GET `/api/reports`
   - POST `/api/reports` with valid payload
   - DELETE `/api/reports/[id]`

**Expected Results**:
- Unauthenticated API requests are rejected with 401 Unauthorized
- Authenticated requests to endpoints requiring higher privileges are rejected with 403 Forbidden

### Test 6.2: Role Spoofing Prevention

**Objective**: Verify that users cannot spoof their role.

**Steps**:
1. Log in as a 'developer' user
2. Using browser developer tools, attempt to modify the user's role in local storage or cookies
3. Refresh the page and attempt to access admin-only features

**Expected Results**:
- Client-side role modifications have no effect on server-side authorization
- Admin-only features remain inaccessible despite client-side tampering

## Test Results Tracking

| Test ID | Test Name | Pass/Fail | Notes |
|---------|-----------|-----------|-------|
| 1.1 | New User Registration | | |
| 1.2 | Registration Validation | | |
| 2.1 | Successful Login | | |
| 2.2 | Failed Login Attempts | | |
| 2.3 | Logout Functionality | | |
| 3.1 | Protected Route Access | | |
| 3.2 | Public Route Access | | |
| 4.1 | Developer Role Permissions | | |
| 4.2 | Admin Role Permissions | | |
| 4.3 | Role-Based UI Elements | | |
| 5.1 | Session Persistence | | |
| 5.2 | Concurrent Sessions | | |
| 5.3 | Session Timeout | | |
| 6.1 | Direct API Access | | |
| 6.2 | Role Spoofing Prevention | | |
