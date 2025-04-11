# 📝 Mini-Spec: Mentions & Notifications

## 📡 Milestone 7 – Mentions & Notifications

### 🎯 Objective

Implement a robust @mention system to enhance user interactions and lay the groundwork for future features:

- Real-time notifications
- Task assignment and attention-drawing mechanisms
- AI-powered mention suggestions

This milestone aims to deepen collaborative capabilities and set the stage for a more reactive, real-time user experience.

### 📦 Core Features

| Feature | Description |
|---------|-------------|
| @mention syntax | Enable users to tag teammates in comments or reports |
| Mention parsing | Detect and extract mentions on the client-side, persist in database |
| Mention resolution | Provide real-time autocomplete/search for usernames |
| Notification hook | Create a basic notification when a mention is registered |
| Mention highlighting | Visually distinguish mentions in the UI (e.g., @Username) |
| Notification dropdown | (Optional) Display unread mentions or actions |

### 🧠 Technical Considerations

1. **Mention Extraction:**
   - Implement regex-based capture of @username in content
   - Alternative: Utilize TipTap node extension for inline mention handling

2. **Autocomplete Logic:**
   - Fetch user list (scoped to the same group)
   - Implement fuzzy search via client-side filter or Supabase edge function

3. **Mention Storage:**
   - In comments/reports: `{ mentions: [userId1, userId2] }`
   - In notifications table: `{ userId, type: 'mention', contextId, seen: false }`

### 📁 Backend Changes

1. Add `notifications` table in Supabase:
   ```typescript
   {
     id: string
     userId: string
     type: "mention"
     contextId: string // commentId or reportId
     createdAt: Date
     seen: boolean
   }
   ```

2. Modify `postComment()` server action:
   - Parse @mentions from content
   - Look up corresponding userIds
   - Add to mentions array
   - Create notification entries

### 💻 Frontend Enhancements

1. **Mention Autocomplete:**
   - Implement dropdown below input when typing @
   - Add keyboard navigation support
   - Insert username reference into text

2. **Highlight Mentions:**
   - Render @username with distinct badge or color
   - (Optional) Link to user profile or display hover card

3. **Notification UI:**
   - Add notification badge to navigation (🔔)
   - Implement dropdown list of unseen mentions
   - Allow marking notifications as seen

### 🛡️ Permissions

| Action | Access |
|--------|--------|
| Mention lookup | Logged-in users in same group |
| Mention user | Any group peer or admin |
| View notifications | Self only |
| System creation | Handled server-side only |

### ✅ Acceptance Criteria

- [ ] Users can type and resolve @mention tags
- [ ] Mentioned users receive a notification
- [ ] Mentions are visually highlighted in comments
- [ ] Mentioning is restricted to group-accessible users
- [ ] Notifications are stored and retrievable
- [ ] (Optional) Notification panel is implemented

### 🔜 Future Milestone Preparation

- 🟢 Implement AI-based mention suggestions (e.g., `recommendMentionUsers(content)`)
- 🟢 Develop notification digest system (email and in-app)
- 🟢 Create mention history and activity log

