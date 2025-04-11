# 💬 Mini-Spec: Threaded Commenting System for Reportly

## 🎯 Objective

Implement a robust, threaded commenting system for the Reportly platform with the following key capabilities:

1. Comment Creation: Users can leave comments on reports.
2. Nested Replies: Support for threaded discussions through nested replies.
3. Real-time Updates: Live-updating discussion threads under each report.
4. User-based Deletion: Users can remove their own comments.
5. Admin Moderation: Administrators have the power to delete any comment.

This system is designed to be extensible, supporting future enhancements such as AI-assisted suggestions and @mention notifications.

---

## 📦 Data Model: `Comment`

| Field       | Type     | Description                                           |
|-------------|----------|-------------------------------------------------------|
| `id`        | string   | Unique identifier for the comment (MongoDB ObjectId)  |
| `reportId`  | string   | Reference to the associated report                    |
| `userId`    | string   | Supabase user ID of the comment author                |
| `content`   | string   | The main body of the comment                          |
| `parentId`  | string?  | Optional reference to parent comment (for replies)    |
| `createdAt` | Date     | Timestamp of comment creation (for sorting)           |
| `updatedAt` | Date     | Timestamp of last edit                                |
| `mentions`  | string[] | Array of mentioned user IDs (for future @mentions)    |

---

## 🧠 Core Functionality

1. **Commenting**: Authenticated users can post top-level comments on reports.
2. **Threading**: Nested replies are supported through the `parentId` field.
3. **Access Control**: Comments are only visible and editable by users with report access.
4. **Deletion**: 
   - Users can delete their own comments.
   - Administrators have the authority to delete any comment.
5. **Real-time Rendering**: The UI dynamically renders the comment thread with proper indentation and timestamps.
6. **Mention Preparation**: @username style mentions are visually rendered (notification logic to be implemented later).

---

## 🛠️ Backend Architecture: Server Actions

Location: `app/actions/comment/`

| Function                        | Purpose                                                   |
|---------------------------------|-----------------------------------------------------------|
| `postComment(input)`            | Create a new comment or reply                             |
| `getCommentsByReport(reportId)` | Fetch all comments for a specific report, sorted by time  |
| `deleteComment(commentId)`      | Remove a comment (with owner or admin verification)       |

**Important:** All server actions must implement the following checks:
- User authentication
- Report access verification (`report.userId === user.id` OR same group membership)
- Role-based permission for admin actions

---

## 🧱 Frontend Component Structure

| Component           | Responsibility                                               |
|---------------------|--------------------------------------------------------------|
| `CommentSection.tsx`| Main container for all comment-related components            |
| `CommentForm.tsx`   | Input interface for creating new comments or replies         |
| `CommentThread.tsx` | Recursive component for rendering nested comment structure   |
| `CommentItem.tsx`   | Individual comment display (author, timestamp, actions)      |

**Integration:** Render `<CommentSection />` within `ReportPageContainer.tsx` or immediately below the report editor.

---

## ⚙️ User Experience Guidelines

1. Comment Display:
   - Show user avatar and name (when available)
   - Display timestamp
   - Implement nested indentation for replies
2. Interactive Elements:
   - "Reply" and "Delete" buttons for each comment (subject to permissions)
3. Optimistic Updates:
   - Immediately append new comments to the UI
   - Provide error feedback via toast notifications on failure
4. Accessibility:
   - Ensure proper keyboard navigation and screen reader support

---

## 🔐 Permission Matrix

| Action              | Required Role/Condition                    |
|---------------------|-------------------------------------------|
| Post comment        | `developer` or `admin`                     |
| Delete own comment  | Comment author (`userId === currentUser.id`) |
| Delete any comment  | `admin` role                               |
| View comments       | User with report access                    |

---

## 🔁 Future Enhancements (Extensibility)

1. AI-powered Comment Suggestions:
   - Implement `assistComment()` function for AI-generated responses
2. Notification System:
   - Add support for reply and @mention notifications
3. Engagement Features:
   - Introduce emoji reactions to comments
4. Rich Text Support:
   - Enable markdown or basic formatting within comments

---

## ✅ Acceptance Criteria

To consider this feature complete, the following must be implemented:

- [ ] Comment data model and database schema
- [ ] Functional comment and reply system with proper threading
- [ ] Server actions with robust authentication and authorization checks
- [ ] Recursive frontend rendering of comment threads
- [ ] Conditional rendering of delete buttons based on ownership/admin status
- [ ] Proper scoping of comment visibility to report owner and group members
- [ ] Visual representation of @mentions (even without full functionality)

---
