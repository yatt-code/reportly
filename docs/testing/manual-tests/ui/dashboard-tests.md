#### Manual Test Script for Dashboard

**Prerequisites:**
- A test user account with at least 5 reports
- Reports created on different days of the week

**Test 1: Report List Display**
1. Log in to the application with the test user account
2. Navigate to the Dashboard page
3. Verify that:
   - The most recent reports are displayed (up to 5 by default)
   - Each report shows the correct title, status, and creation date
   - Each report shows the correct sentiment tags
   - Reports are ordered by creation date (newest first)

**Test 2: Report Interaction**
1. On the Dashboard page, hover over a report card
2. Verify that:
   - Action buttons appear (e.g., duplicate, share, delete)
   - Clicking on a report navigates to the report detail page
   - Clicking the duplicate button creates a copy of the report
   - Clicking the delete button removes the report from the list

**Test 3: Activity Stats**
1. Navigate to the Dashboard page
2. Verify that:
   - The daily streak counter shows the correct number of consecutive days with reports
   - The weekly report count shows the correct number of reports created in the current week
   - The stats update correctly after creating a new report

**Test 4: Weekly Heatmap**
1. Navigate to the Dashboard page
2. Verify that:
   - The heatmap shows activity for the last 7 days
   - Days with more reports have darker/more intense colors
   - Days with no reports have the lightest color
   - The heatmap updates correctly after creating a new report

**Test 5: New Report Button**
1. Navigate to the Dashboard page
2. Verify that:
   - The New Report button is clearly visible
   - Clicking the button navigates to the report creation page
   - The button is accessible on both desktop and mobile views