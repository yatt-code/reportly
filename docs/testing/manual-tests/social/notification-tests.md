# Manual Test Script: Notifications

This document provides step-by-step instructions for manually testing the Notifications functionality of the Reportly application.

## Prerequisites

- A clean browser (or incognito/private window) to avoid session conflicts
- Access to the Reportly application URL
- At least two user accounts for testing notifications (User A and User B)
- Both users should be in the same group

## 1. Notification Badge

### Test 1.1: Badge Visibility

**Objective**: Verify that the notification badge is displayed correctly when there are unread notifications.

**Steps**:
1. Log in as User A
2. Have User B create a comment that mentions User A (e.g., "@userA please review this")
3. Log out and log in as User A
4. Observe the notification bell icon in the navigation bar

**Expected Results**:
- A red badge should appear on the notification bell icon
- The badge should display the number of unread notifications (1 in this case)
- If there are more than 9 unread notifications, the badge should display "9+"

### Test 1.2: Badge Count Updates

**Objective**: Verify that the badge count updates when notifications are marked as seen.

**Steps**:
1. Log in as User A with at least 2 unread notifications
2. Note the current badge count
3. Click the notification bell icon to open the dropdown
4. Click on one of the notifications
5. Observe the notification badge

**Expected Results**:
- The badge count should decrease by 1
- If all notifications are marked as seen, the badge should disappear

## 2. Notification Dropdown

### Test 2.1: Opening and Closing the Dropdown

**Objective**: Verify that the notification dropdown opens and closes correctly.

**Steps**:
1. Log in to the application
2. Click the notification bell icon
3. Observe the dropdown
4. Click outside the dropdown
5. Observe the dropdown again

**Expected Results**:
- The dropdown should open when the bell icon is clicked
- The dropdown should display a list of notifications or an empty state message
- The dropdown should close when clicking outside of it

### Test 2.2: Notification List Display

**Objective**: Verify that notifications are displayed correctly in the dropdown.

**Steps**:
1. Log in as User A with at least one notification
2. Click the notification bell icon to open the dropdown
3. Observe the notifications in the list

**Expected Results**:
- Each notification should show:
  - An icon representing the notification type (e.g., message icon for mentions)
  - The notification content (e.g., "You were mentioned in a comment")
  - The report title where the notification occurred
  - A relative timestamp (e.g., "2 hours ago")
- Notifications should be sorted with the most recent at the top

### Test 2.3: Empty State

**Objective**: Verify that an appropriate message is displayed when there are no notifications.

**Steps**:
1. Log in as a user with no notifications (or mark all notifications as seen)
2. Click the notification bell icon to open the dropdown
3. Observe the content of the dropdown

**Expected Results**:
- The dropdown should display a message indicating there are no unread notifications
- The message should be clear and user-friendly

## 3. Marking Notifications as Seen

### Test 3.1: Marking a Notification as Seen by Clicking

**Objective**: Verify that clicking a notification marks it as seen and navigates to the relevant content.

**Steps**:
1. Log in as User A with at least one unread notification
2. Click the notification bell icon to open the dropdown
3. Click on a notification
4. Observe what happens

**Expected Results**:
- The notification should be marked as seen (removed from the dropdown)
- The badge count should decrease by 1
- The user should be navigated to the relevant content (e.g., the report with the comment where they were mentioned)
- The specific comment should be highlighted or scrolled into view

### Test 3.2: Notification Persistence

**Objective**: Verify that notifications remain marked as seen across sessions.

**Steps**:
1. Log in as User A
2. Mark a notification as seen by clicking on it
3. Log out and log back in as User A
4. Click the notification bell icon to open the dropdown

**Expected Results**:
- The previously seen notification should not appear in the dropdown
- The badge count should not include the seen notification

## 4. Notification Creation

### Test 4.1: Mention Notification Creation

**Objective**: Verify that a notification is created when a user is mentioned in a comment.

**Steps**:
1. Log in as User A
2. Navigate to a report
3. Create a comment that mentions User B (e.g., "@userB please review this")
4. Log out and log in as User B
5. Observe the notification bell icon and dropdown

**Expected Results**:
- User B should see a notification badge on the bell icon
- The dropdown should contain a notification about being mentioned
- The notification should link to the correct report and comment

### Test 4.2: Multiple Mentions

**Objective**: Verify that multiple mentions in a single comment create separate notifications.

**Steps**:
1. Log in as User A
2. Create a comment that mentions multiple users (e.g., "@userB and @userC please review")
3. Log out and log in as User B
4. Check for a notification
5. Log out and log in as User C
6. Check for a notification

**Expected Results**:
- Both User B and User C should receive separate notifications
- Each notification should link to the same comment

### Test 4.3: Self-Mention Handling

**Objective**: Verify that mentioning yourself does not create a notification.

**Steps**:
1. Log in as User A
2. Create a comment that includes a mention of yourself (e.g., "I (@userA) will handle this")
3. Observe the notification bell icon

**Expected Results**:
- No notification should be created for the self-mention
- The badge count should not increase

## 5. Real-time Updates

### Test 5.1: New Notification Toast

**Objective**: Verify that a toast notification appears when a new mention is received while the user is online.

**Steps**:
1. Open two browser windows or tabs
2. Log in as User A in the first window
3. Log in as User B in the second window
4. As User B, create a comment that mentions User A
5. Observe User A's window

**Expected Results**:
- A toast notification should appear in User A's window
- The toast should indicate that User A was mentioned
- The notification badge should update without requiring a page refresh

## Test Results Tracking

| Test ID | Test Name | Pass/Fail | Notes |
|---------|-----------|-----------|-------|
| 1.1 | Badge Visibility | | |
| 1.2 | Badge Count Updates | | |
| 2.1 | Opening and Closing the Dropdown | | |
| 2.2 | Notification List Display | | |
| 2.3 | Empty State | | |
| 3.1 | Marking a Notification as Seen by Clicking | | |
| 3.2 | Notification Persistence | | |
| 4.1 | Mention Notification Creation | | |
| 4.2 | Multiple Mentions | | |
| 4.3 | Self-Mention Handling | | |
| 5.1 | New Notification Toast | | |
