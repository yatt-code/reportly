# 🧭 Mini-Spec: M3 – Authentication, Role-Based Access Control (RBAC), and User Management

## 🎯 Objective

Implement a robust and secure system for authentication, role-based access control (RBAC), and user management in Reportly, ensuring proper access scoping and feature availability based on user roles.

## 📦 Core Features

| Feature | Description | Implementation Details |
|---------|-------------|------------------------|
| Supabase Auth | Secure sign-up, sign-in, and session management | Utilize Supabase's built-in authentication system |
| Role Assignment | Assign `admin` and `developer` roles to users | Store roles in user metadata or a separate database table |
| RBAC Utility | Permission checking for frontend and backend | Implement hooks and server-side functions for role verification |
| Admin Dashboard | User and role management interface | Create a protected route accessible only to admins |
| Protected Routes | Secure access to private pages and server actions | Implement middleware for route protection |

## 🔐 Role-Based Access Control (RBAC)

### Role Definitions:
- `admin`: Full system access, including user management and all report operations
- `developer`: Standard access for report creation, editing, and viewing own reports

### Key Utilities:
- `getCurrentUser()`: Retrieves current session and user details
- `hasRole(role)`: Client-side hook for conditional UI rendering based on user role
- `enforceRole(role)`: Server-side guard for protecting actions based on required role

## 🛠️ Server Actions & Role-Based Guards

| Action | Required Role | Notes |
|--------|---------------|-------|
| Save/edit/delete report | `developer`, `admin` | Developers can only modify their own reports |
| Delete any user's comment | `admin` | Admins have moderation capabilities |
| Access admin dashboard | `admin` | Exclusive admin functionality |

## 🧰 Frontend Enhancements

- Implement `useUserRole()` hook for easy role checking in components
- Create `useHasRole('admin')` for conditional admin UI rendering
- Develop `useEnforceRole()` utility to protect server actions
- Set up a barrel export for `lib/rbac/` with auto-generated role utilities
- Provide comprehensive JSDoc documentation for all role-based methods

## ✅ Acceptance Criteria

- [ ] Implement Supabase authentication for user sign-up and sign-in
- [ ] Store and retrieve user roles from the database
- [ ] Enforce role-based access consistently across frontend and backend
- [ ] Create an admin-only accessible dashboard for user management
- [ ] Implement route protection to prevent unauthorized access

## 📅 Implementation Timeline

| Task | Estimated Duration | Priority |
|------|---------------------|----------|
| Supabase auth integration | 0.5 day | High |
| Role-based utility development | 1 day | High |
| Admin dashboard creation | 1 day | Medium |
| RBAC enforcement implementation | 0.5 day | High |

## 🔄 Next Steps

1. Set up Supabase project and configure authentication settings
2. Implement user registration with default role assignment
3. Develop core RBAC utilities and integrate them into the existing codebase
4. Create the admin dashboard with user management capabilities
5. Implement and test route protection for all sensitive pages and actions

---

