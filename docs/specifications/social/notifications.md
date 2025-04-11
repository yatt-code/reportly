# 🔔 Mini-Spec: Mention Notifications

## 🎯 Objective

Implement a robust **Mention Notification System** in Reportly to enhance user engagement and collaboration.

When a user is @mentioned in a comment:
1. A notification is recorded in the system
2. The mentioned user can view their unseen notifications
3. Visual feedback is provided (badge, dropdown, or dedicated page)

This system lays the foundation for an **engagement feedback loop**, enabling future expansion to various notification types and AI-driven summaries.

---

## 📦 Notification Data Model

### Supabase Table: `notifications`

| Field       | Type     | Description |
|-------------|----------|-------------|
| `id`        | UUID     | Unique identifier (auto-generated) |
| `userId`    | UUID     | ID of the user being notified |
| `type`      | ENUM     | Notification type (e.g., `"mention"`) |
| `contextId` | UUID     | ID of the context (e.g., `commentId`) |
| `reportId`  | UUID     | ID of the associated report |
| `seen`      | BOOLEAN  | Notification status |
| `createdAt` | TIMESTAMP| Creation timestamp |

**Notes**:
- Implement Supabase `Row Level Security (RLS)` to restrict reads to the `userId`
- Future notification types may include: `"reply"`, `"assigned"`, `"reaction"`, etc.

---

## 🛠️ Backend Logic

### 1. Extend `postComment` Server Action

Location: `src/app/actions/comment/postComment.ts`

```typescript
// After resolving mentions
for (const userId of mentionedUserIds) {
  if (userId !== currentUser.id) { // Prevent self-notifications
    await supabase.from("notifications").insert({
      userId,
      type: "mention",
      contextId: commentId,
      reportId,
      seen: false,
    });
  }
}
```

### 2. Implement `getNotifications` Server Action

Create: `src/app/actions/notifications/getNotifications.ts`

```typescript
export async function getNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select("*, comments(content), reports(title)")
    .eq("userId", session.user.id)
    .eq("seen", false)
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return data;
}
```

### 3. Implement `markNotificationAsSeen` Server Action

Create: `src/app/actions/notifications/markNotificationAsSeen.ts`

```typescript
export async function markNotificationAsSeen(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ seen: true })
    .eq("id", notificationId)
    .eq("userId", session.user.id);

  if (error) throw error;
}
```

---

## 💻 Frontend Components

### 1. NotificationBadge.tsx

```typescript
interface NotificationBadgeProps {
  count: number;
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count === 0) return null;
  return <span className="badge">{count}</span>;
}
```

### 2. NotificationDropdown.tsx

```typescript
export function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getNotifications();
      setNotifications(data);
    };
    fetchNotifications();
  }, []);

  return (
    <div className="dropdown">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onSeen={() => markNotificationAsSeen(notification.id)}
        />
      ))}
    </div>
  );
}
```

### 3. NotificationContext.tsx (Optional)

```typescript
export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await getNotifications();
      setNotifications(data);
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}
```

---

## 🛡️ Access Control

| Action              | Scope                    |
|---------------------|--------------------------|
| Insert notification | Server-side only         |
| Read notifications  | User's own notifications |
| Mark as seen        | User's own notifications |
| Visibility          | No public API            |

---

## 🧪 Optional Enhancements

1. Implement hover preview for comment content
2. Set up real-time updates using Supabase subscriptions
3. Create a dedicated `/notifications` page for a comprehensive view
4. Integrate AI-powered notification digests (e.g., "You've been mentioned in 3 reports this week")

---

## ✅ Acceptance Criteria

- [ ] Notifications are created when users are @mentioned (excluding self-mentions)
- [ ] Users can view their unseen notifications
- [ ] Users can mark notifications as seen
- [ ] UI displays a badge indicating unread notification count
- [ ] Clicking a notification navigates to the relevant report/comment
- [ ] All user actions are properly secured and scoped

---

