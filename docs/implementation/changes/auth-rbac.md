# 📝 Change Summary: Authentication & RBAC

## Supabase Core Setup

The initial setup for Supabase authentication has been completed with the following changes:

- **Supabase Client Initialization**: Added `src/lib/supabaseClient.ts` to initialize and provide a singleton Supabase client instance using environment variables.
- **Authentication Helpers**: Created `src/lib/auth.ts` with helper functions (`login`, `register`, `logout`) that utilize the Supabase client for authentication operations. These functions include Zod validation for credentials and assign the default 'developer' role upon registration.

## Authentication Context & Provider

The Authentication Context and Provider have been implemented to manage user authentication state across the application:

- **AuthProvider Component**: Added `src/components/auth/AuthProvider.tsx` to initialize a React Context. This component checks the Supabase session on mount, listens for authentication state changes, and provides values such as `user`, `session`, `isAuthenticated`, and `isLoading`.
- **useUser Hook**: Created `src/lib/useUser.ts` to re-export the context hook from `AuthProvider`, simplifying the consumption of authentication state in other components.

## Pages, Forms, and Routing Logic

The Login and Register pages, along with route protection middleware, have been implemented as follows:

- **Forms**: Developed `LoginForm.tsx` and `RegisterForm.tsx` components with input handling, server action calls (`login`, `register`), loading/error states, toast notifications, and redirection logic.
- **Page Routes**: Added corresponding page routes at `app/login/page.tsx` and `app/register/page.tsx`.
- **Global Wrapping**: Wrapped the root layout (`src/app/layout.tsx`) with the `AuthProvider` and included the `Toaster` component for notifications.
- **Route Protection**: Implemented `middleware.ts` in the project root to enforce route protection. This leverages `@supabase/ssr` to check authentication status and redirect users appropriately between public and protected routes.

The route protection requirement is already fulfilled by the existing middleware.ts file. It correctly checks the user's authentication status using Supabase session data and redirects unauthenticated users attempting to access protected routes (like /dashboard and /report/*) to the /login page. A separate requireAuth utility is not needed with this middleware implementation.

## Report Ownership & Access Control

### Add UserId to Report Schema, create `getCurrentUser()` Helper

Initial steps for implementing report ownership have been completed:

1. **Report Schema Update**:
   - Modified `src/models/Report.js`
   - Changed `userId` field to `type: String`
   - Aligns with Supabase user IDs

2. **getCurrentUser Helper**:
   - Added to `src/lib/auth.ts`
   - Uses `@supabase/ssr` pattern with `cookies()` from `next/headers`
   - Retrieves authenticated user in server-side contexts
   - Note: May show static analysis errors in TypeScript (known limitation)

### Ownership Verification in Server Actions

Implemented report ownership and access control logic in backend server actions:

1. Updated CRUD operations:
   - `saveReport`, `deleteReport`, `getReportById`: Now fetch current user via `getCurrentUser()` and validate ownership before proceeding.
   - Unauthorized attempts return a "Forbidden" error.

2. Enhanced creation and duplication:
   - `saveReport` and `duplicateReport`: Assign `userId` of authenticated user to new/duplicate reports.

3. Improved user-specific report fetching:
   - `getReportsByUser`: Now uses server-side authenticated user ID, eliminating the need for a parameter.

4. Frontend adjustment:
   - `ReportListItem.tsx`: Removed redundant user ID argument in `duplicateReport` call.

These changes ensure all report CRUD operations are properly scoped to the authenticated user.

### Page-level Ownership UX
Page-level ownership checks have been implemented to ensure users can only access and interact with their own reports:

1. **Dashboard Page**:
   - Refactored `ReportList.tsx` to accept `initialReports` as props and use a consistent internal data type (`ReportListItemData`).
   - Updated `src/app/dashboard/page.tsx` to fetch reports server-side using the ownership-aware `getReportsByUser` action and pass the data to `ReportList`.

2. **Report Detail Page**:
   - Updated `src/app/(report)/report/[id]/page.tsx` to fetch the report server-side using `getReportById`.
   - Implemented redirection to `/dashboard` if the user is not the owner.
   - Added `notFound()` handling if the report doesn't exist.

3. **Report Page Container**:
   - Refactored `ReportPageContainer.tsx` to remove internal data fetching.
   - Modified to accept the `initialData` prop from the server component page.

These changes ensure users only see and access their own reports on both the dashboard and report detail pages, enhancing security and user-specific content management.

### Enhanced Ownership Checks and User Experience

To further improve report ownership management and user experience, the following enhancements have been implemented:

1. **Centralized Ownership Validation**:
   - Created `src/lib/utils/assertOwnership.ts` with the `assertOwnership` utility function.
   - This function provides a reusable way to validate report ownership across the application.

2. **Streamlined Server Actions**:
   - Integrated `assertOwnership` into `saveReport`, `deleteReport`, `getReportById`, and `duplicateReport` actions.
   - This integration simplifies the code in these actions and ensures consistent error handling for unauthorized access attempts.

3. **Improved Access Denied UI**:
   - Developed `src/components/NotAuthorized.tsx` to display a user-friendly message for access denied scenarios.
   - This component enhances the user experience by providing clear feedback when attempting to access unauthorized reports.

4. **Enhanced Report Detail Page**:
   - Updated `src/app/(report)/report/[id]/page.tsx` to utilize the `NotAuthorized` component.
   - Now, instead of a simple redirect, users see a informative message when trying to access reports they don't own.

These additional enhancements further strengthen the ownership model, improve code maintainability, and provide a more polished user experience when dealing with access control scenarios.

### Role Storage and Utility Functions
To implement Role-Based Access Control (RBAC), the following foundational utilities and structures have been put in place:

1. **Role Assignment**:
   - Verified that the default 'developer' role is correctly assigned during user registration in `src/lib/auth.ts`.
   - Roles are stored in Supabase `user_metadata.role` for each user.

2. **Client-Side Role Utilities**:
   - Implemented in `src/lib/rbac/hooks.ts`:
     - `useUserRole()`: A React hook for easily accessing the current user's role in UI components.
     - `useHasRole(requiredRole: string | string[])`: A hook for checking if the current user has the required role(s).

3. **Server-Side Role Utilities**:
   - Created in `src/lib/rbac/utils.ts`:
     - `getUserRole(user: User)`: Extracts the role from user metadata.
     - `hasRole(user: User, requiredRole: string | string[])`: Checks if the user has the required role(s).
     - `enforceRole(user: User, requiredRole: string)`: Throws an error if the user doesn't have the required role, useful for Server Actions or Route Handlers.

These utilities provide a consistent and centralized way to manage role-based access control across both client-side and server-side parts of the application, enhancing security and simplifying role management.

### Role-based UI Gating

Role-based UI gating has been implemented for existing components to enhance security and user experience:

1. **ReportListItem.tsx**:
   - The "Delete" button is now conditionally rendered only for users with the 'admin' role.
   - This is achieved using the `useHasRole` hook to check the current user's role.

2. **Future Components**:
   - The following components are planned for future implementation and will incorporate role-based rendering:
     - AssignRoleDropdown
     - InviteToGroupModal
     - AdminNavigation
     - ViewAllReportsToggle

This implementation ensures that UI elements are appropriately displayed based on user roles, improving both security and user interface consistency.

### Securing Pages and Server Actions

To enhance security and enforce role-based access control at both the page and server action levels, the following implementations have been made:

1. **Admin Page Protection**:
   - Created a placeholder admin page (`src/app/admin/users/page.tsx`) with server-side role verification.
   - Utilizes `getCurrentUser` and `hasRole('admin')` to check user permissions.
   - Non-admin users are automatically redirected to the dashboard.

2. **Server Action Role Enforcement**:
   - Updated the `deleteReport` server action as a reference implementation.
   - Integrated the `enforceRole('admin', user)` utility to restrict execution to administrators only.
   - Implemented proper error handling, throwing a 'Forbidden' error for unauthorized attempts.

3. **Error Handling Enhancement**:
   - Refined the catch block in server actions to provide more specific error messages and appropriate status codes.

These changes demonstrate the pattern for securing both admin pages and server actions, ensuring that only users with the appropriate roles can access sensitive functionalities.

## Summary of Authentication & RBAC Implementation
The Authentication and RBAC implementation for Reportly provides a comprehensive security system with the following key components:

1. **Role Assignment**:
   - Verified that the default 'developer' role is correctly assigned during user registration in `src/lib/auth.ts`.
   - Roles are stored in Supabase `user_metadata.role` for each user.

2. **Client-Side Role Utilities**:
   - Implemented in `src/lib/rbac/hooks.ts`:
     - `useUserRole()`: A React hook for easily accessing the current user's role in UI components.
     - `useHasRole(requiredRole: string | string[])`: A hook for checking if the current user has the required role(s).

3. **Server-Side Role Utilities**:
   - Created in `src/lib/rbac/utils.ts`:
     - `getUserRole(user: User)`: Extracts the role from user metadata.
     - `hasRole(user: User, requiredRole: string | string[])`: Checks if the user has the required role(s).
     - `enforceRole(user: User, requiredRole: string)`: Throws an error if the user doesn't have the required role, useful for Server Actions or Route Handlers.

4. **RBAC Enhancements**:
   - Created a barrel file (`src/lib/rbac/index.ts`) to re-export RBAC hooks and utilities for easier importing.
   - Added JSDoc comments to the server-side RBAC utility functions (`getUserRole`, `hasRole`, `enforceRole`) in `src/lib/rbac/utils.ts` to clarify the default denial behavior for missing or unknown roles.

These utilities provide a consistent and centralized way to manage role-based access control across both client-side and server-side parts of the application, enhancing security and simplifying role management.
