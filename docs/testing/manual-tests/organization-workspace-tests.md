# Manual Test Script: Organization & Workspace System

This document outlines manual test procedures for the Organization & Workspace system in the Reportly application.

## Prerequisites

- A test user account with login credentials
- Access to the Reportly application
- Clean test data (or ability to create new organizations/workspaces)

## Test Cases

### 1. Organization Creation

**Objective**: Verify that a new user can create an organization.

**Steps**:
1. Log in to the application with a new user account
2. Navigate to Settings > Organization
3. Enter "Test Organization" in the organization name field
4. Click "Save Changes"

**Expected Results**:
- Success message is displayed: "Organization created successfully"
- Organization name is displayed as "Test Organization"
- Organization information shows "1 Member"
- A default workspace is automatically created

### 2. Workspace Creation

**Objective**: Verify that a user can create a new workspace.

**Steps**:
1. Log in to the application
2. Navigate to Settings > Workspaces
3. Click "Create Workspace"
4. Enter "Test Workspace" in the workspace name field
5. Click "Create"

**Expected Results**:
- Success message is displayed
- New workspace appears in the workspaces list
- Workspace name is displayed as "Test Workspace"

### 3. Workspace Switching

**Objective**: Verify that a user can switch between workspaces.

**Steps**:
1. Log in to the application
2. Ensure you have at least two workspaces
3. Note the current active workspace in the navbar
4. Click on the workspace switcher in the navbar
5. Select a different workspace from the dropdown

**Expected Results**:
- The active workspace in the navbar updates to the selected workspace
- The reports list updates to show reports from the selected workspace
- The "Active" indicator in the workspaces settings page moves to the selected workspace

### 4. Workspace Editing

**Objective**: Verify that a user can edit a workspace.

**Steps**:
1. Log in to the application
2. Navigate to Settings > Workspaces
3. Find a workspace in the list
4. Click the edit (pencil) icon
5. Change the workspace name to "Updated Workspace"
6. Click "Save"

**Expected Results**:
- Success message is displayed
- Workspace name is updated to "Updated Workspace" in the list
- Workspace name is updated in the workspace switcher if it's the active workspace

### 5. Workspace Deletion

**Objective**: Verify that a user can delete a workspace.

**Steps**:
1. Log in to the application
2. Navigate to Settings > Workspaces
3. Ensure you have at least two workspaces and one is not the active workspace
4. Find a non-active workspace in the list
5. Click the delete (trash) icon
6. Confirm deletion in the confirmation dialog

**Expected Results**:
- Success message is displayed
- Workspace is removed from the list
- Workspace is removed from the workspace switcher dropdown

### 6. Active Workspace Persistence

**Objective**: Verify that the active workspace persists across page navigation and sessions.

**Steps**:
1. Log in to the application
2. Switch to a specific workspace
3. Navigate to a different page (e.g., Settings)
4. Navigate back to the dashboard
5. Log out and log back in

**Expected Results**:
- The active workspace remains the same after navigating to different pages
- The active workspace remains the same after logging out and back in

### 7. Organization Update

**Objective**: Verify that a user can update their organization name.

**Steps**:
1. Log in to the application
2. Navigate to Settings > Organization
3. Change the organization name to "Updated Organization"
4. Click "Save Changes"

**Expected Results**:
- Success message is displayed: "Organization updated successfully"
- Organization name is updated to "Updated Organization"

### 8. Workspace Access Control

**Objective**: Verify that workspace access control is enforced.

**Steps**:
1. Log in to the application with a test user
2. Note the URL of a report in the current workspace
3. Switch to a different workspace
4. Try to access the report from the first workspace using the noted URL

**Expected Results**:
- Access is denied or the user is redirected to an appropriate page
- Error message indicates that the user does not have access to the resource

### 9. Report Creation in Workspace

**Objective**: Verify that reports are created in the active workspace.

**Steps**:
1. Log in to the application
2. Switch to a specific workspace
3. Create a new report
4. Switch to a different workspace
5. Check if the report appears in the reports list
6. Switch back to the original workspace
7. Check if the report appears in the reports list

**Expected Results**:
- The report only appears in the workspace where it was created
- The report does not appear in other workspaces

### 10. Error Handling

**Objective**: Verify that the system handles errors gracefully.

**Steps**:
1. Log in to the application
2. Navigate to Settings > Workspaces
3. Try to delete the active workspace
4. Try to delete the only workspace
5. Try to create a workspace with an empty name
6. Try to update a workspace with an empty name

**Expected Results**:
- Appropriate error messages are displayed for each scenario
- The system prevents deletion of the active workspace
- The system prevents deletion of the only workspace
- The system prevents creation/update of workspaces with empty names

## Reporting Issues

If any test fails or behaves unexpectedly, please document the following:

1. Test case number and name
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots or videos if applicable
6. Browser and device information

Submit the issue report to the development team for investigation.
