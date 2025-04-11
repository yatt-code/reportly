# 🧭 Milestone 8 – Organizations & Workspaces

## 🎯 Objective
Implement multi-tenant collaboration through Organizations and Workspaces, establishing a scalable foundation for team-based collaboration, Role-Based Access Control (RBAC) scoping, and future enterprise features.

## 📦 Key Features
1. **Organizations**: Top-level entities representing companies or institutions
2. **Workspaces**: Sub-entities under organizations (e.g., departments, project teams)
3. **User Association**: Users belong to one organization and multiple workspaces
4. **Scoped Content**: Reports, comments, and AI activity tied to specific workspaces and organizations
5. **Enhanced Roles**: Roles scoped to workspace and organization levels (e.g., `orgAdmin`, `workspaceEditor`)
6. **Migration**: Automated creation of default organizations and workspaces for existing users and their data

## 🧱 Implementation Roadmap
1. Database Schema Updates
   - [ ] Create MongoDB `organizations` collection
   - [ ] Create MongoDB `workspaces` collection
   - [ ] Update `users` schema with `organizationId` and `workspaceIds[]`
   - [ ] Modify `reports`, `comments`, and `notifications` to include `workspaceId` and `organizationId`

2. Backend Enhancements
   - [ ] Refactor queries to filter by `activeWorkspaceId`
   - [ ] Update RBAC utilities for scoped permissions
   - [ ] Develop migration script for existing users

3. Frontend Development
   - [ ] Implement workspace switching UI and context management
   - [ ] Enhance onboarding flow to create default org/workspace for new users

## 🔐 Access Control Matrix
| Action | Scope | Notes |
|--------|-------|-------|
| View/Create/Edit Report | Workspace member | Basic workspace operations |
| Create Workspace | Organization Admin | Org-level management |
| Join Org/Workspace | By invite or admin approval | Controlled access |

## ✅ Acceptance Criteria
1. User-Organization-Workspace Association
   - [ ] Users linked to an `organizationId` and multiple `workspaceIds`
   - [ ] All features scoped to the current workspace
   - [ ] Queries and permissions reflect scoped access

2. Data Migration and UI
   - [ ] Successful execution of migration script for existing users
   - [ ] Intuitive UI for switching between workspaces (and organizations in future)
   - [ ] Reports, comments, and notifications correctly reflect workspace/org ownership

3. Performance and Security
   - [ ] Minimal impact on system performance with new scoping
   - [ ] Robust security measures to prevent unauthorized cross-workspace/org access

## 📅 Timeline Estimate
| Phase | Duration | Details |
|-------|----------|---------|
| Database & Schema Setup | 1 day | Collections and schema updates |
| Backend Enhancements | 1.5 days | Query refactors, RBAC updates, migration script |
| Frontend Development | 1 day | Workspace switching UI, onboarding flow updates |
| Testing & QA | 1 day | Comprehensive testing of new features and migrations |
| Buffer | 0.5 day | For unforeseen challenges and final polishing |

**Total Estimated Duration:** 5 working days

## 🚀 Next Steps
- Conduct a team review of the implementation plan
- Set up a staging environment for testing the migration script
- Begin with database schema updates and backend enhancements

**Current Status:** 🚧 In Progress
