# 🧾 Mini-Spec: Report Ownership & Access Control

## 🎯 Objective

Ensure that **each report is tied to a specific user** and that only the owner can access, edit, or delete it. This involves associating reports with `user.id` from Supabase Auth and updating server actions and dashboard logic accordingly.

---

## 🔐 Ownership Rules

1. Each report **must include a `userId`** field (string) representing the owner (from Supabase).
2. Only the **owner** can:
    - View, edit, or delete the report.
    - Fetch the report in dashboard or list views.
3. Unauthorized access attempts should:
    - Return a **403 Forbidden** response in server actions.
    - Redirect to `/dashboard` in pages.

---

## 🧱 Schema Updates

Update the `Report` model to include the `userId` field:

```ts
userId: {
  type: String,
  required: true,
  index: true,
}
```

Ensure `userId` is passed during the following actions:
- `saveReport`
- `createReport`
- `duplicateReport`

---

## 🛠️ Server Actions to Update

| **Action**          | **Update**                                                                 |
|----------------------|---------------------------------------------------------------------------|
| `saveReport()`       | Validate ownership before saving (ensure `userId` matches).              |
| `deleteReport()`     | Validate ownership before deleting.                                      |
| `getReportsByUser()` | Fetch only reports where `userId === session.user.id`.                   |
| `getReportById()`    | Return the report only if `userId === session.user.id`.                  |
| `duplicateReport()`  | Copy the report and assign `userId` to the current user.                 |

All actions must include user context (e.g., `session` or `supabase.auth.getUser()`).

---

## 📋 Required Changes

| **File**                  | **Task**                                                                 |
|---------------------------|-------------------------------------------------------------------------|
| `models/Report.ts`        | Add `userId` to the schema.                                             |
| `lib/auth.ts`             | Add `getCurrentUser()` if not already present.                         |
| `app/actions/report/`     | Update all relevant server actions to validate and use `userId`.       |
| `dashboard/page.tsx`      | Display only reports belonging to the current user.                    |
| `report/[id]/page.tsx`    | Show a **403 message** if the current user doesn’t own the report.      |

---

## 🧪 Optional Enhancements

- **Zod Validation**: Add a `reportSchemaWithUserId` to validate ownership data.
- **Utility Function**: Create `assertOwnership(report, userId)` to simplify ownership checks.
- **Fallback Component**: Add a `NotAuthorized.tsx` component to display when access is denied.

---

## 🔐 Access Control Behavior

| **Action**              | **Authorization Check**                              |
|--------------------------|-----------------------------------------------------|
| View report (`/report/[id]`) | User must match `report.userId`.                     |
| Save/update report       | User must match `report.userId`.                     |
| Delete report            | User must match `report.userId`.                     |
| List in dashboard        | Fetch only reports where `userId === session.user.id`. |

---

## ✅ Acceptance Criteria

- Every report includes a `userId` field in the database.
- Users only see their own reports on the dashboard.
- All server actions validate ownership.
- Non-owners are blocked (via **403** or redirect).
- Report duplication assigns ownership to the current user.
