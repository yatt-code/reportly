# Manual Test Script: AI Suggestion System

This document provides step-by-step instructions for manually testing the AI Suggestion System functionality of the Reportly application.

## Prerequisites

- A clean browser (or incognito/private window) to avoid session conflicts
- Access to the Reportly application URL
- A user account with permission to create and edit reports

## 1. Suggestion Appearance After Typing

### Test 1.1: Suggestions Appear After Typing

**Objective**: Verify that AI suggestions appear after typing content in the report editor.

**Steps**:
1. Log in to the Reportly application
2. Navigate to create a new report or edit an existing report
3. Type a paragraph of text (at least 2-3 sentences)
4. Wait for a few seconds (to allow for debounce delay)
5. Observe the AI suggestion panel

**Expected Results**:
- After the debounce delay, suggestions should appear in the AI suggestion panel
- The suggestions should be relevant to the content you typed
- Each suggestion should have a type/title, suggestion text, and confidence score

### Test 1.2: Suggestions Update After Content Changes

**Objective**: Verify that suggestions update when the report content changes.

**Steps**:
1. Open a report for editing with existing suggestions
2. Make significant changes to the report content (e.g., delete a paragraph, add new content)
3. Wait for the debounce delay
4. Observe the AI suggestion panel

**Expected Results**:
- The suggestions should update to reflect the new content
- Old suggestions that are no longer relevant should be replaced with new ones

## 2. Accept/Dismiss Suggestion Functionality

### Test 2.1: Accepting a Suggestion

**Objective**: Verify that accepting a suggestion applies the suggested edit to the report.

**Steps**:
1. Open a report for editing
2. Wait for suggestions to appear in the AI suggestion panel
3. Click the "Accept" button (check icon) on one of the suggestions
4. Observe the report content

**Expected Results**:
- The suggested text should be inserted into the report at the appropriate location
- The editor should maintain focus after the insertion
- The suggestion should be applied exactly as shown in the suggestion panel

### Test 2.2: Dismissing a Suggestion

**Objective**: Verify that dismissing a suggestion removes it from the panel.

**Steps**:
1. Open a report for editing
2. Wait for suggestions to appear in the AI suggestion panel
3. Note the number of suggestions displayed
4. Click the "Dismiss" button (X icon) on one of the suggestions
5. Observe the AI suggestion panel

**Expected Results**:
- The dismissed suggestion should be removed from the panel
- The remaining suggestions should still be visible
- The panel should adjust its layout to accommodate the removal

### Test 2.3: Regenerating Suggestions

**Objective**: Verify that the regenerate button fetches new suggestions.

**Steps**:
1. Open a report for editing
2. Wait for suggestions to appear in the AI suggestion panel
3. Note the current suggestions
4. Click the "Regenerate" button (refresh icon) in the panel header
5. Observe the AI suggestion panel

**Expected Results**:
- The panel should show a loading state
- After a brief delay, new suggestions should appear
- The new suggestions may be different from the previous ones

## 3. Panel State Handling

### Test 3.1: Loading State

**Objective**: Verify that the panel displays a loading state while fetching suggestions.

**Steps**:
1. Open a report for editing
2. Observe the AI suggestion panel immediately after the page loads
3. Make significant changes to the report content
4. Observe the panel immediately after making changes

**Expected Results**:
- The panel should display a loading indicator (spinner) while fetching suggestions
- The loading state should be replaced with suggestions once they are available

### Test 3.2: Empty State

**Objective**: Verify that the panel handles the case when no suggestions are available.

**Steps**:
1. Open a report for editing
2. Delete all content from the report
3. Wait for the debounce delay
4. Observe the AI suggestion panel

**Expected Results**:
- The panel should display a message indicating that no suggestions are available
- The message should be clear and user-friendly

### Test 3.3: Error State

**Objective**: Verify that the panel handles errors gracefully.

**Steps**:
1. Open a report for editing
2. Disconnect from the internet (turn off Wi-Fi or network connection)
3. Make changes to the report content
4. Wait for the debounce delay
5. Observe the AI suggestion panel

**Expected Results**:
- The panel should display an error message
- The error message should be clear and user-friendly
- The regenerate button should still be available to retry

## 4. Integration with Editor

### Test 4.1: Suggestion Panel Visibility Toggle

**Objective**: Verify that the suggestion panel can be toggled on and off.

**Steps**:
1. Open a report for editing
2. Locate the button or control to toggle the AI suggestion panel
3. Click the toggle button to hide the panel
4. Make changes to the report content
5. Click the toggle button again to show the panel

**Expected Results**:
- The panel should hide when toggled off
- The panel should reappear when toggled on
- Suggestions should continue to update in the background even when the panel is hidden

### Test 4.2: Suggestion Context Awareness

**Objective**: Verify that suggestions are context-aware based on the current content.

**Steps**:
1. Open a report for editing
2. Type content with specific issues (e.g., grammatical errors, repetitive phrases)
3. Wait for suggestions to appear
4. Observe the types and content of the suggestions

**Expected Results**:
- Suggestions should be relevant to the specific issues in the content
- Different types of suggestions (grammar, clarity, etc.) should appear based on the content

## Test Results Tracking

| Test ID | Test Name | Pass/Fail | Notes |
|---------|-----------|-----------|-------|
| 1.1 | Suggestions Appear After Typing | | |
| 1.2 | Suggestions Update After Content Changes | | |
| 2.1 | Accepting a Suggestion | | |
| 2.2 | Dismissing a Suggestion | | |
| 2.3 | Regenerating Suggestions | | |
| 3.1 | Loading State | | |
| 3.2 | Empty State | | |
| 3.3 | Error State | | |
| 4.1 | Suggestion Panel Visibility Toggle | | |
| 4.2 | Suggestion Context Awareness | | |
