# Manual Test Script: Comments & Mentions

This document provides step-by-step instructions for manually testing the Comments & Mentions functionality of the Reportly application.

## Prerequisites

- A clean browser (or incognito/private window) to avoid session conflicts
- Access to the Reportly application URL
- At least two user accounts in the same group for testing mentions
- One admin user account for testing role-based deletion

## 1. Comment Nesting

### Test 1.1: Creating Top-Level Comments

**Objective**: Verify that users can create top-level comments on a report.

**Steps**:
1. Log in to the Reportly application
2. Navigate to an existing report or create a new one
3. Scroll to the comment section at the bottom of the report
4. Enter text in the comment input field
5. Click the "Post Comment" button
6. Repeat steps 4-5 to create multiple top-level comments

**Expected Results**:
- Each comment should appear in the comment section
- Comments should be displayed in chronological order (newest at the bottom)
- Each comment should show the author's name and timestamp
- The comment content should be displayed correctly

### Test 1.2: Creating Nested Replies

**Objective**: Verify that users can reply to existing comments, creating a nested thread.

**Steps**:
1. Navigate to a report with existing comments
2. Find a comment and click the "Reply" button
3. Enter text in the reply input field
4. Click the "Post Reply" button
5. Find a reply and click its "Reply" button to create a second-level reply
6. Enter text and post the second-level reply

**Expected Results**:
- Replies should be visually nested under their parent comments
- Each level of nesting should have increased indentation
- The reply should show the author's name and timestamp
- The reply content should be displayed correctly
- Multiple levels of nesting should work correctly (at least 3 levels)

### Test 1.3: Visual Appearance of Nested Comments

**Objective**: Verify that nested comments are visually distinct and properly indented.

**Steps**:
1. Navigate to a report with nested comments (create them if necessary)
2. Observe the visual appearance of the comment threads

**Expected Results**:
- Each level of nesting should have clear visual indentation
- Comment threads should be visually grouped together
- It should be easy to distinguish between different threads
- The UI should handle deep nesting gracefully (not becoming too narrow)

## 2. Mention Autocomplete

### Test 2.1: Mention Autocomplete Appears

**Objective**: Verify that the mention autocomplete appears when typing '@'.

**Steps**:
1. Navigate to a report
2. Start creating a new comment
3. Type '@' in the comment input field
4. Observe the autocomplete dropdown

**Expected Results**:
- An autocomplete dropdown should appear after typing '@'
- The dropdown should show a list of users from the same group
- Each user entry should show their username and/or full name

### Test 2.2: Filtering Mention Suggestions

**Objective**: Verify that mention suggestions are filtered based on input.

**Steps**:
1. Start creating a new comment
2. Type '@' followed by the first few letters of a username
3. Observe the autocomplete dropdown

**Expected Results**:
- The dropdown should filter users based on the typed characters
- Only usernames matching the input should be shown
- The filtering should be case-insensitive

### Test 2.3: Group-Based Filtering

**Objective**: Verify that only users from the same group are shown in mention suggestions.

**Steps**:
1. Log in with a user from Group A
2. Start creating a comment and type '@'
3. Note the users shown in the dropdown
4. Log out and log in with a user from Group B
5. Start creating a comment and type '@'
6. Note the users shown in the dropdown

**Expected Results**:
- When logged in as a user from Group A, only users from Group A should be shown
- When logged in as a user from Group B, only users from Group B should be shown
- Users from other groups should not appear in the suggestions

### Test 2.4: Selecting a Mention

**Objective**: Verify that selecting a mention from the dropdown correctly inserts it into the comment.

**Steps**:
1. Start creating a new comment
2. Type '@' to trigger the autocomplete
3. Select a user from the dropdown (by clicking or using keyboard navigation)
4. Continue typing the rest of the comment
5. Post the comment

**Expected Results**:
- The selected username should be inserted into the comment with the '@' prefix
- The mention should be visually distinct (e.g., highlighted or styled differently)
- The comment should post successfully with the mention intact

## 3. Mention Notifications

### Test 3.1: Creating a Mention Notification

**Objective**: Verify that mentioning a user creates a notification for them.

**Steps**:
1. Log in as User A
2. Create a comment mentioning User B (e.g., "@userB Check this out!")
3. Post the comment
4. Log out and log in as User B
5. Navigate to the notifications area

**Expected Results**:
- User B should see a notification indicating they were mentioned by User A
- The notification should include a link to the report where the mention occurred
- The notification should show when it was created

### Test 3.2: Multiple Mentions in One Comment

**Objective**: Verify that multiple mentions in a single comment create separate notifications.

**Steps**:
1. Log in as User A
2. Create a comment mentioning multiple users (e.g., "@userB and @userC please review")
3. Post the comment
4. Log out and log in as User B
5. Check for a notification
6. Log out and log in as User C
7. Check for a notification

**Expected Results**:
- Both User B and User C should receive separate notifications
- Each notification should link to the same comment

### Test 3.3: Self-Mention Handling

**Objective**: Verify that mentioning yourself does not create a notification.

**Steps**:
1. Log in as User A
2. Create a comment that includes a mention of yourself (e.g., "I (@userA) will handle this")
3. Post the comment
4. Navigate to the notifications area

**Expected Results**:
- No notification should be created for the self-mention
- The mention should still be visually displayed in the comment

## 4. Role-Based Comment Deletion

### Test 4.1: User Deleting Own Comment

**Objective**: Verify that users can delete their own comments.

**Steps**:
1. Log in as a regular user (non-admin)
2. Create a new comment
3. Locate the delete button or option for the comment
4. Click the delete button
5. Confirm the deletion if prompted

**Expected Results**:
- The comment should be deleted and removed from the UI
- A success message should be displayed
- The comment should not reappear after refreshing the page

### Test 4.2: User Cannot Delete Others' Comments

**Objective**: Verify that regular users cannot delete comments made by other users.

**Steps**:
1. Log in as User A
2. Create a comment
3. Log out and log in as User B (non-admin)
4. Navigate to the report with User A's comment
5. Check if a delete option is available for User A's comment

**Expected Results**:
- User B should not see a delete button or option for User A's comment
- If attempting to delete via API or other means, the operation should be denied

### Test 4.3: Admin Deleting Any Comment

**Objective**: Verify that admin users can delete any comment.

**Steps**:
1. Log in as a regular user
2. Create a comment
3. Log out and log in as an admin user
4. Navigate to the report with the comment
5. Locate the delete button or option for the comment
6. Click the delete button
7. Confirm the deletion if prompted

**Expected Results**:
- The admin should see a delete button or option for all comments
- The comment should be deleted and removed from the UI
- A success message should be displayed
- The comment should not reappear after refreshing the page

## Test Results Tracking

| Test ID | Test Name | Pass/Fail | Notes |
|---------|-----------|-----------|-------|
| 1.1 | Creating Top-Level Comments | | |
| 1.2 | Creating Nested Replies | | |
| 1.3 | Visual Appearance of Nested Comments | | |
| 2.1 | Mention Autocomplete Appears | | |
| 2.2 | Filtering Mention Suggestions | | |
| 2.3 | Group-Based Filtering | | |
| 2.4 | Selecting a Mention | | |
| 3.1 | Creating a Mention Notification | | |
| 3.2 | Multiple Mentions in One Comment | | |
| 3.3 | Self-Mention Handling | | |
| 4.1 | User Deleting Own Comment | | |
| 4.2 | User Cannot Delete Others' Comments | | |
| 4.3 | Admin Deleting Any Comment | | |
