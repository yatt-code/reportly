# Dashboard Mini-Spec

## Purpose
The Dashboard serves as the central hub for users to:
- Quickly overview their report activity.
- Interact with their reports through features like:
    - Viewing a list of recent reports.
    - Accessing high-level report statistics (e.g., daily streak, productivity summary).
    - Viewing sentiment tags or AI-generated labels.
    - Tracking activity via a weekly heatmap, similar to GitHub’s activity graph.

---

## Components

### 1. Report List View
- Displays the 5 most recent reports (mock or real).
- Each report entry includes:
    - **Report Title**
    - **Status** (Draft / Complete)
    - **Date Created**
    - **Sentiment Tags** (AI-generated, e.g., “issue”, “task”, “update”)
- Includes a “Show more” button to load additional reports (up to 50 at a time).

### 2. Activity Stats
- Displays:
    - **Daily Streak**: Number of consecutive days the user has submitted a report.
    - **Productivity Summary**: Count of reports submitted, with breakdowns (e.g., “5 Reports this week”).

### 3. Weekly Activity Heatmap
- Visualizes report activity over the week, similar to GitHub’s activity graph.
- Each cell represents the number of reports submitted on a specific day.

### 4. “New Report” Button
- A floating button for quickly creating a new report.
- Redirects the user to the Report Editor page (or modal) upon clicking.

---

## UI/UX Requirements

### Layout
- Clean and intuitive layout.
- Includes a sidebar or top navigation for easy access to features like “New Report.”
- Reports displayed in a grid or list view for easy scanning.

### Responsiveness
- Fully responsive design for both desktop and mobile views.
- Adapts the list view to smaller screens (e.g., single-column layout).

---

## Backend & Data

### Mock Data (Until Backend Integration)
- **Reports**: Mock data for title, creation date, and tags.
- **Stats**: Hardcoded or computed stats based on mock data.
- **Activity Heatmap**: Hardcoded weekly streak data.

### Planned API Endpoints
- `GET /api/reports`: Fetch a list of reports.
- `GET /api/stats`: Fetch productivity and streak data.
- `GET /api/activity-heatmap`: Fetch heatmap activity data.

---

## Interactions

### 1. View Report
- Clicking on a report navigates the user to the individual Report Page.

### 2. Show More
- Clicking “Show more” loads additional reports from the backend or mock data.

### 3. Create New Report
- Clicking the “New Report” button navigates the user to the Report Editor.

---

## Functional Requirements

### 1. List of Recent Reports
- Displays 5 reports by default.
- Each report includes status, tags, and creation date.

### 2. AI Tagging
- Displays AI-generated sentiment tags (e.g., “issue,” “task,” “update”) next to each report title.

### 3. Activity Stats
- Computes and displays the daily streak.
- Shows a productivity summary with the number of reports created within a selected time frame.

### 4. Weekly Heatmap
- Displays a heatmap of report submissions over the last week.

### 5. New Report Button
- Clearly visible and sticky on both mobile and desktop views.

---

## Next Steps
1. Implement the frontend layout for the Dashboard Page and Report List View.
2. Add mock data for reports and activity stats.
3. Implement interactivity for:
     - Viewing reports in detail by clicking on them.
     - Loading additional reports with the “Show more” button.
     - Creating new reports via the “New Report” button.

---

This Dashboard / Report List View will provide users with a simple yet powerful overview of their reports and activity. Once implemented, the backend API can be connected to fetch real data, and the components can be fine-tuned for production.
