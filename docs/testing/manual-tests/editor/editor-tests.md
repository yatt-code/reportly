# Manual Test Script: Report Editor Functionality

This document provides step-by-step instructions for manually testing the Report Editor functionality of the Reportly application.

## Prerequisites

- A clean browser (or incognito/private window) to avoid session conflicts
- Access to the Reportly application URL
- A user account with permission to create and edit reports

## 1. Autosave Functionality

### Test 1.1: Autosave Triggers After Delay

**Objective**: Verify that the autosave functionality triggers after the specified delay.

**Steps**:
1. Log in to the Reportly application
2. Navigate to create a new report or edit an existing report
3. Make changes to the report content
4. Wait for the autosave delay (approximately 2 seconds)
5. Look for visual indicators that the save was triggered (e.g., "Saving..." or "Saved" message)

**Expected Results**:
- After the delay, the autosave should trigger automatically
- A visual indicator should show that the save is in progress and then completed
- No manual save action should be required

### Test 1.2: Multiple Changes Within Delay Period

**Objective**: Verify that multiple changes within the delay period only trigger one save.

**Steps**:
1. Open a report for editing
2. Make a change to the report content
3. Quickly make another change within 1-2 seconds
4. Observe the save indicators

**Expected Results**:
- Only one save operation should be triggered after the delay
- The save should include all changes made during the delay period

## 2. Report Saving to Database

### Test 2.1: Creating a New Report

**Objective**: Verify that a new report is correctly saved to the database.

**Steps**:
1. Navigate to create a new report
2. Enter a title for the report
3. Add content to the report
4. Wait for autosave or manually save the report
5. Navigate away from the page (e.g., to the dashboard)
6. Return to the report list and find the newly created report
7. Open the report to verify its content

**Expected Results**:
- The report should be saved with the correct title and content
- The report should appear in the report list
- The report content should be preserved when reopened

### Test 2.2: Updating an Existing Report

**Objective**: Verify that changes to an existing report are correctly saved to the database.

**Steps**:
1. Open an existing report for editing
2. Make changes to the title and/or content
3. Wait for autosave or manually save the report
4. Navigate away from the page
5. Return to the report and verify that the changes were saved

**Expected Results**:
- The changes should be saved to the database
- The updated content should be visible when the report is reopened

### Test 2.3: Error Handling During Save

**Objective**: Verify that errors during save operations are handled gracefully.

**Steps**:
1. Open a report for editing
2. Make changes to the report
3. Disconnect from the internet (turn off Wi-Fi or network connection)
4. Attempt to save the report (either through autosave or manual save)
5. Observe error handling behavior
6. Reconnect to the internet and try saving again

**Expected Results**:
- An appropriate error message should be displayed when the save fails
- The user should be able to retry the save operation
- After reconnecting, the save should succeed

## 3. Mermaid Diagram Rendering

### Test 3.1: Basic Mermaid Diagram

**Objective**: Verify that basic Mermaid diagrams are correctly rendered in the editor.

**Steps**:
1. Open a report for editing
2. Insert a code block with the language set to "mermaid"
3. Add a simple Mermaid diagram code, such as:
   ```mermaid
   graph TD;
       A-->B;
       A-->C;
       B-->D;
       C-->D;
   ```
4. Observe the rendering of the diagram

**Expected Results**:
- The Mermaid code should be rendered as a visual diagram
- The diagram should accurately represent the code

### Test 3.2: Complex Mermaid Diagram

**Objective**: Verify that more complex Mermaid diagrams are correctly rendered.

**Steps**:
1. Open a report for editing
2. Insert a code block with the language set to "mermaid"
3. Add a more complex Mermaid diagram code, such as:
   ```mermaid
   sequenceDiagram
       participant Alice
       participant Bob
       Alice->>John: Hello John, how are you?
       loop Healthcheck
           John->>John: Fight against hypochondria
       end
       Note right of John: Rational thoughts <br/>prevail!
       John-->>Alice: Great!
       John->>Bob: How about you?
       Bob-->>John: Jolly good!
   ```
4. Observe the rendering of the diagram

**Expected Results**:
- The complex diagram should be correctly rendered
- All elements (participants, arrows, notes, loops) should be displayed properly

### Test 3.3: Invalid Mermaid Syntax

**Objective**: Verify that invalid Mermaid syntax is handled gracefully.

**Steps**:
1. Open a report for editing
2. Insert a code block with the language set to "mermaid"
3. Add invalid Mermaid syntax, such as:
   ```mermaid
   graph TD;
       A-->B;
       This is invalid syntax
       B-->C;
   ```
4. Observe the error handling

**Expected Results**:
- An error message should be displayed indicating the syntax error
- The error should not crash the editor or prevent other content from being edited

## 4. Keyboard Shortcuts

### Test 4.1: Ctrl+Enter to Save

**Objective**: Verify that the Ctrl+Enter keyboard shortcut triggers an immediate save.

**Steps**:
1. Open a report for editing
2. Make changes to the report content
3. Press Ctrl+Enter (or Cmd+Enter on Mac)
4. Observe the save behavior

**Expected Results**:
- The save should be triggered immediately (without waiting for the autosave delay)
- A visual indicator should show that the save is in progress and then completed

### Test 4.2: Other Editor Keyboard Shortcuts

**Objective**: Verify that other standard editor keyboard shortcuts work correctly.

**Steps**:
1. Open a report for editing
2. Test the following keyboard shortcuts:
   - Ctrl+B (or Cmd+B on Mac) for bold text
   - Ctrl+I (or Cmd+I on Mac) for italic text
   - Ctrl+Z (or Cmd+Z on Mac) to undo
   - Ctrl+Shift+Z (or Cmd+Shift+Z on Mac) to redo

**Expected Results**:
- Each keyboard shortcut should perform its expected function
- The formatting changes should be applied correctly

## 5. Editor UI and Interaction

### Test 5.1: Editor Toolbar

**Objective**: Verify that the editor toolbar functions correctly.

**Steps**:
1. Open a report for editing
2. Test each button on the editor toolbar (if available):
   - Bold, italic, underline buttons
   - Heading level buttons
   - List buttons (bullet and numbered)
   - Code block button
   - Link button
   - Image button

**Expected Results**:
- Each toolbar button should apply the correct formatting
- The formatting should be visible in the editor

### Test 5.2: Copy and Paste

**Objective**: Verify that copy and paste functionality works correctly.

**Steps**:
1. Open a report for editing
2. Type some text and format it (e.g., make some text bold, create a list)
3. Select the formatted text and copy it (Ctrl+C or Cmd+C)
4. Place the cursor at another location and paste (Ctrl+V or Cmd+V)
5. Copy text from an external source (e.g., a website or document) and paste it into the editor

**Expected Results**:
- Copied text should retain its formatting when pasted within the editor
- Text copied from external sources should be pasted with appropriate formatting

## Test Results Tracking

| Test ID | Test Name | Pass/Fail | Notes |
|---------|-----------|-----------|-------|
| 1.1 | Autosave Triggers After Delay | | |
| 1.2 | Multiple Changes Within Delay Period | | |
| 2.1 | Creating a New Report | | |
| 2.2 | Updating an Existing Report | | |
| 2.3 | Error Handling During Save | | |
| 3.1 | Basic Mermaid Diagram | | |
| 3.2 | Complex Mermaid Diagram | | |
| 3.3 | Invalid Mermaid Syntax | | |
| 4.1 | Ctrl+Enter to Save | | |
| 4.2 | Other Editor Keyboard Shortcuts | | |
| 5.1 | Editor Toolbar | | |
| 5.2 | Copy and Paste | | |
