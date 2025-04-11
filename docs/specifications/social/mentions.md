# 📅 Mini-Spec: @Mention Parsing and UI Rendering

## 🎯 Objective

Implement a comprehensive @mention feature for comments and reports, enhancing user interaction and engagement. This feature will serve as a foundation for future in-app notifications (planned for M7).

### Key Components:
1. @mention parsing from content
2. UI rendering for mentions (highlighting and user linking)
3. Autocomplete suggestions for users
4. Backend storage for future notifications

## 🧠 Core Features

### 1. Mention Parsing
- Detect `@username` syntax in comment content
- Extract usernames and resolve to user IDs (via Supabase query or predefined list)
- Store mentions in comment data (using a mentions array in the database)

### 2. Mention Autocomplete UI
- Trigger user list on typing `@`
- Implement fuzzy search or simple username filtering
- Utilize `useAsyncEffect` for data fetching

### 3. Mention Highlighting in UI
- Render `@username` with visual distinction (e.g., bold, blue text)
- Optionally link to user profiles or display hover cards

### 4. Backend Integration
- Extend comment schema with a mentions field for user IDs
- Update `postComment` to parse and store mentions

## 📦 Schema Updates

### Comment Schema
```typescript
{
  // ... existing fields
  mentions: string[] // Array of mentioned user IDs
}
```

## 🔧 Backend Changes

### 1. Parse Mentions on Comment Creation
File: `postComment.ts`
- Parse `@username` from content before database save
- Use regex for mention detection:
  ```javascript
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  ```
- Resolve `@username` mentions to user IDs via Supabase
- Save user IDs in the comment's mentions array

### 2. Save Mentions in Comment Document
- Store mentioned user IDs in the comment's mentions field
  ```javascript
  const mentionedUsers = ['userId1', 'userId2'];
  ```

## 💻 Frontend Components

### 1. Mention Autocomplete (MentionInput.tsx)
- Implement textarea/input field with `@` listener
- Fetch users from backend or local list
- Provide async search functionality
- UX:
  - Display selectable username list
  - Show suggestion dropdown on `@` typing
  - Insert selected `@username` into content

### 2. Mention Rendering (CommentItem.tsx)
- Detect and visually distinguish `@username` syntax
- Optionally link to user profiles or show tooltips
  ```tsx
  const Mention = ({ username }) => (
    <span style={{ color: 'blue', fontWeight: 'bold' }}>
      @{username}
    </span>
  );
  ```

## 🔐 Permissions & Visibility
- Mention parsing: Available to logged-in users within the same group
- User suggestions: Limited to users in the same group (data privacy)
- Permissions:
  - Users can only mention others in their group
  - Non-group members excluded from autocomplete suggestions

## ✅ Acceptance Criteria
1. Successful mention detection in comment content
2. Visually distinct rendering of `@username` tags
3. Functional links to user profiles or hover cards
4. Proper storage of mentioned users in comment schema
5. Autocomplete with fuzzy username search
6. Group-based mention restrictions
