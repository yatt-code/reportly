# 🛡️ Technical Specification: RBAC (Role-Based Access Control)

## 🎯 Objective

Implement a robust and scalable **Role-Based Access Control (RBAC)** system in **Reportly**. This system will enable granular access management, ensuring different user types can interact with the application securely and appropriately. The RBAC system will support:

1. Secure feature gating
2. Future moderation capabilities
3. Team hierarchy management

---

## 🔑 Role Definitions

| Role       | Description                                            |
|------------|--------------------------------------------------------|
| `admin`    | Full access, including user and group management       |
| `developer`| Standard user, manages own reports                     |
| *(future)* | `read-only`, `moderator`, `group-admin`                |

---

## 🧠 Role Capabilities Matrix

| Action                    | `admin` | `developer`              |
|---------------------------|---------|--------------------------|
| Create reports            | ✅      | ✅                       |
| View own reports          | ✅      | ✅                       |
| View all reports          | ✅      | ❌                       |
| Edit/delete own reports   | ✅      | ✅                       |
| Delete others' reports    | ✅      | ❌                       |
| Manage users/roles        | ✅      | ❌                       |
| Manage groups             | ✅      | ❌                       |
| View group activity       | ✅      | ✅ (within own group)    |
| Access admin dashboard    | ✅      | ❌                       |

---

## 📦 Implementation Strategy

### 1. Role Storage
- Location: **Supabase `user_metadata.role`**
- Assignment:
  - Default role: `developer` (set during registration)
  - Admin upgrade: Manual process via Supabase UI or admin panel

### 2. Core Utilities

| Utility                                  | Purpose                                        |
|------------------------------------------|------------------------------------------------|
| `useUserRole()`                          | React hook to fetch current user's role        |
| `hasRole(required: string | string[])`   | Check if user has required role(s)             |
| `enforceRoleInServerAction(required: string)` | Server-side role validation (throws 403 if unauthorized) |

---

## 📄 Access Control by Page

| Route                    | Access Rule                                |
|--------------------------|---------------------------------------------|
| `/dashboard`             | ✅ All authenticated users                  |
| `/report/[id]`           | ✅ Report owner only                        |
| `/admin/users`           | ❌ Admin-only (hidden from `developer`)     |
| `/admin/groups` (future) | ❌ Admin-only                               |
| Shared reports (future)  | ✅ If public or within user's group         |

---

## 🛑 UI Component Gating

| Component                 | Access Restriction    |
|---------------------------|------------------------|
| `DeleteReportButton` (for others' reports) | `admin` only |
| `AssignRoleDropdown`      | `admin` only           |
| `InviteToGroupModal`      | `admin` only           |
| `AdminNavigation` Sidebar | `role === 'admin'`     |
| `ViewAllReportsToggle`    | `admin` only           |

---

## ✨ Server-Side Enforcement Example

```typescript
export async function deleteReport(reportId: string) {
  const user = await getCurrentUser();
  const report = await ReportModel.findById(reportId);

  if (report.userId !== user.id && user.role !== 'admin') {
    throw new Error('Forbidden: insufficient privileges');
  }

  await ReportModel.deleteOne({ _id: reportId });
}
```

---

## 🧪 Future Enhancements
1. Implement `RoleBadge` component for visual role identification
2. Add admin privilege highlights on user dashboards
3. Expand role system to include `group-admin` in Milestone 4 (Social Features)

---

## ✅ Acceptance Criteria
1. `user_metadata.role` is consistently respected across UI and backend
2. All admin-only features are properly access-controlled
3. Standard users cannot access or modify data outside their scope
4. Role checks are implemented using centralized helpers/hooks (DRY principle)
5. Admin dashboard is exclusively rendered for admin users
