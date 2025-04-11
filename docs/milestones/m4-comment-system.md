# 📝 Mini-Spec: Comment System & Social Layer

## 🧭 Milestone 4: Social Layer & Group Collaboration

### 🎯 Objective

Transform Reportly into a multi-user knowledge environment by implementing:

1. Threaded comments with AI assistance
2. Group system for team-based report visibility
3. Mentioning system
4. Basic achievement hooks for gamified engagement

These features will enable collaborative reporting, feedback, and group-based content interaction.

### 📦 Core Features in M4

| Feature | Description |
|---------|-------------|
| 🧵 Threaded Commenting | Nested comments for reports (discussions, feedback, updates) |
| 📣 @Mention System | Notify or assign tasks by mentioning teammates |
| 👥 Group System | Team-based report visibility and user grouping |
| 🎖️ Achievement Framework | Track user engagement metrics and milestones |
| 🔔 Notification Hook | Internal system for tracking mentionable events (optional) |

### 🧩 Feature Breakdown

#### 1. Comment System (Threaded)
- **Model**: `commentId`, `reportId`, `userId`, `content`, `parentId`, `createdAt`
- **UI Components**: 
  - `CommentInput`
  - `CommentThread` (recursive)
- **Server Actions**: 
  - `postComment`
  - `getCommentsByReportId`
  - `deleteComment` (owner/admin only)

#### 2. Mentioning System
- Detect @username in comment text
- Extract mentions for future notification hooks
- Implement mention lookup dropdown (basic autocomplete)
- Highlight mentions in comment UI

#### 3. Group System
- **Supabase Tables**:
  - `groups`: `id`, `name`, `ownerId`, `createdAt`
  - `user_groups`: `userId`, `groupId`
- **Server Actions**:
  - `getUserGroups`
  - `createGroup`
  - `inviteUserToGroup`
- Reports can have optional `groupId`
- Report visibility: owned OR same group

#### 4. Achievement Hooks (Foundation)
- Create `user_achievements` collection
- Track: first comment, 5 comments, first mention, 3-day comment streak
- Hook events: `postComment`, `@mention` parse
- Future: Display badges in dashboard/profile

### 🔐 Access Control

| Feature | Required Role |
|---------|---------------|
| Commenting | developer, admin |
| Delete others' comments | admin only |
| Group creation | admin |
| Mentioning | All logged-in users |

### 🧪 Optional Enhancements
- AI comment suggester (`assistComment()`)
- Dedicated notifications page
- Comment moderation UI
- View-only access mode

### ✅ Acceptance Criteria
1. Users can post threaded comments on accessible reports
2. Comments support @mention syntax with user linking
3. Admins can create and manage groups
4. Reports can be assigned to groups; members can view
5. Achievement system tracks comment-based events
6. Non-group members cannot access group reports

### 📅 Timeline Estimate

| Phase | Estimated Time |
|-------|----------------|
| Comments system (backend + UI) | 2–3 days |
| Mentioning system | 1–2 days |
| Group access logic | 2–3 days |
| Achievement/event hooks | 1–2 days |
| Polish + documentation | 1 day |

### 🧠 Agent Integration Strategy

Leverage Agent-as-Team setup by assigning different agents to:
- Comments
- Mentions
- Group CRUD and permissioning
- Achievement hook logic
- UI integration

