# 🔐 Technical Specification: Authentication Flow

## 🎯 Objective

Implement a complete authentication system for Reportly using **Supabase Auth**. The system must support the following features:

- Email/password registration and login
- Logout functionality
- Persistent authentication context
- Session validation for protected routes
- Automatic redirection after login/logout
- Role assignment (default: `developer`)

---

## 🧩 Key Features

| Feature                  | Status | Notes                                   |
|--------------------------|--------|-----------------------------------------|
| Email/password login     | 🔜     | Form-based                              |
| Email/password register  | 🔜     | Automatically assigns default role      |
| Logout functionality     | 🔜     | Clears Supabase session and local state |
| AuthContext              | 🔜     | Provides `user`, `loading`, `isAuthenticated` |
| Route protection         | 🔜     | Secures dashboard, reports, and editor  |
| Redirect behavior        | 🔜     | Redirects to dashboard after login      |

---

## 📦 Required Files

| File                              | Purpose                                   |
|-----------------------------------|-------------------------------------------|
| `lib/supabaseClient.ts`           | Singleton client for Supabase SDK         |
| `lib/auth.ts`                     | Helper functions for login, register, logout |
| `lib/useUser.ts`                  | Hook for accessing AuthContext across the app |
| `components/auth/AuthProvider.tsx`| Wraps layout and injects authentication context |
| `components/auth/LoginForm.tsx`   | UI form for login                         |
| `components/auth/RegisterForm.tsx`| UI form for registration                  |
| `app/login/page.tsx`              | Login route                               |
| `app/register/page.tsx`           | Registration route                        |
| `app/layout.tsx`                  | Application layout wrapped in `AuthProvider` |
| `middleware.ts` (optional)        | Enforces route-level protection           |

---

## 🧠 Authentication Flow Logic

### 1. Registration

- User fills out the `RegisterForm`.
- Calls `register({ email, password })` in `auth.ts`.
- On success:
    - Supabase session is created and stored.
    - Default role `developer` is assigned in `user_metadata`.
    - User is redirected to `/dashboard`.

---

### 2. Login

- User fills out the `LoginForm`.
- Calls `login({ email, password })` in `auth.ts`.
- On success:
    - Session is set in `AuthContext`.
    - User is redirected to `/dashboard`.

---

### 3. Logout

- Calls the `logout()` function:
    - Clears the Supabase session.
    - Resets the local authentication context state.
    - Redirects the user to `/login`.

---

### 4. Session Handling

- On page load, `AuthProvider` checks the session using `supabase.auth.getSession()`.
- The context is initialized with:
    - `user` object
    - `isAuthenticated` boolean
    - `loading` state
- The `useUser()` hook provides access to this context throughout the app.

---

### 🔐 Protected Routes

- Secure routes (e.g., Dashboard, Report Editor) using `requireAuth()`:
    - Redirect unauthenticated users to `/login`.
- Optionally enforce route protection via `middleware.ts` for paths like `/dashboard` and `/report/*`.

---

## ✨ Role Assignment (Basic RBAC Preparation)

- Assign the default role during registration:
    ```ts
    supabase.auth.updateUser({
        data: {
            role: "developer"
        }
    });
    ```
- Use a `useUserRole()` hook to read `user.user_metadata.role`.

---

## 🔄 Redirect Behavior

| Action                          | Redirect To |
|---------------------------------|-------------|
| Successful login                | `/dashboard`|
| After logout                    | `/login`    |
| Accessing `/dashboard` without session | `/login` |

---

## 🔁 Future-Proofing (Optional Enhancements)

- Add OAuth login support (e.g., Google, GitHub) via Supabase UI configuration.
- Implement magic link login as a fallback option.
- Support SSO for enterprise workspaces.

---

## ✅ Acceptance Criteria

- Users can register and log in using email/password.
- Authentication context is accessible throughout the app.
- Users are redirected based on their authentication state.
- Reports are filtered by `userId`.
- Non-authenticated users are blocked from accessing protected pages.
- Default role is assigned during registration.

