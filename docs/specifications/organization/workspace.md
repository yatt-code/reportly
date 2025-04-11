
# 🧭 Mini-Spec: Organization + Workspace Layer

## 🎯 Objective

Implement first-class support for Organizations and Workspaces in Reportly to enable:

1. Team-based collaboration
2. Cross-departmental workspaces
3. Granular role scoping and group segmentation
4. Multi-tenant SaaS architecture

## 🧩 Core Concepts

1. **Organization**: Top-level entity representing a company or institution (e.g., "Datum Clearmind", "TimorTech")
2. **Workspace**: Subdivision of an organization (e.g., Engineering, Sales, AI Research Dept)
3. **User**: Associated with an `organizationId` and one or more `workspaceIds[]`
4. **Report**: Scoped to a specific workspace (and by extension, an organization)

## 📦 Data Model

### 1. Organizations Collection
```typescript
interface Organization {
  _id: ObjectId;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Workspaces Collection
```typescript
interface Workspace {
  _id: ObjectId;
  organizationId: string;
  name: string;
  type: 'team' | 'department' | 'project';
  memberIds: string[];
  createdAt: Date;
}
```

### 3. Users Collection (Updated)
```typescript
interface User {
  // ... existing fields
  organizationId: string;
  workspaceIds: string[];
}
```

### 4. Reports, Comments, Notifications (Updated)
```typescript
interface ScopedDocument {
  // ... existing fields
  workspaceId: string;
  organizationId: string; // Denormalized for performance
}
```

## 🔐 Access Control

### Permissions Flow
| Action           | Required Scope                |
|------------------|-------------------------------|
| View Reports     | Workspace member              |
| Create Report    | Workspace member              |
| Edit/Delete      | Owner or role-sufficient user |
| Create Workspace | Organization admin only       |
| Join Organization| Invited or auto-assigned      |

### RBAC Enhancements
1. Extend `hasRole()` and `enforceRole()` to accept optional scope:
   ```typescript
   hasRole('admin', { scope: 'workspace', id: workspaceId })
   ```
2. Implement scoped roles:
   - `orgAdmin`
   - `workspaceEditor`
   - `workspaceViewer`

## 🔄 Migration Strategy

1. For each existing user:
   a. Create a "Default Organization"
   b. Create a "Default Workspace"
   c. Update user document with new `organizationId` and `workspaceIds`
   d. Update all user's reports with new `workspaceId` and `organizationId`

### Migration Script
```javascript
const users = await db.collection('users').find({});

for (const user of users) {
  const org = await db.collection('organizations').insertOne({
    name: `${user.username}'s Organization`,
    ownerId: user._id,
    createdAt: new Date(),
  });

  const ws = await db.collection('workspaces').insertOne({
    name: "My Workspace",
    organizationId: org.insertedId,
    memberIds: [user._id],
    createdAt: new Date(),
  });

  await db.collection('users').updateOne(
    { _id: user._id },
    {
      $set: {
        organizationId: org.insertedId,
        workspaceIds: [ws.insertedId],
      },
    }
  );

  await db.collection('reports').updateMany(
    { userId: user._id },
    {
      $set: {
        organizationId: org.insertedId,
        workspaceId: ws.insertedId,
      },
    }
  );
}
```

## ✅ Acceptance Criteria

1. Users have an `organizationId` and one or more `workspaceIds`
2. Reports, comments, and notifications are scoped to a workspace/org
3. All data queries filter by active `workspaceId`
4. Organization and Workspace models are fully implemented
5. Default org/workspace are created during onboarding (or seeded for existing users)

## 🧪 Future Enhancements

1. Organization invite system (`inviteByEmail`)
2. Organization-level billing support
3. Workspace-specific dashboards
4. Cross-workspace search functionality (for admins)
5. Workspace archiving and deletion workflows

