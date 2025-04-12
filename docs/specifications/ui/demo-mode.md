# 🧪 Demo Mode Specification

## Overview

Demo Mode allows users to experience the full functionality of Reportly without needing to register or log in. All data created in demo mode is stored only in the user's browser (localStorage and cookies) and is never sent to the server or database.

## User Experience

### Entering Demo Mode

1. Users can enter demo mode from the homepage by clicking the "Try Demo Mode" button.
2. Upon entering demo mode, users are redirected to the dashboard with pre-populated demo reports.
3. A banner at the top of the page indicates that demo mode is active.
4. A demo mode indicator on the dashboard provides additional information and options.

### Demo Mode Features

In demo mode, users can:

- View the dashboard with sample reports, activity stats, and heatmap
- Create new reports
- Edit existing reports
- Delete reports
- Add comments to reports
- View and interact with the UI as if they were logged in

### Data Storage

- All demo data is stored in the browser's localStorage
- A cookie (`reportly_demo_mode=true`) is set to allow server components to detect demo mode
- No data is sent to the server or stored in the database
- Data persists across page refreshes but is lost when the browser is closed or localStorage is cleared

### Exiting Demo Mode

- Users can exit demo mode by clicking the "Exit Demo Mode" button in the banner or dashboard indicator
- Upon exiting, users are redirected to the homepage
- Demo data remains in localStorage until explicitly cleared or the browser cache is cleared

## Technical Implementation

### Components

1. **DemoContext**: React context provider that manages demo state and data
   - Stores demo user information, reports, and comments
   - Provides methods for CRUD operations on demo data
   - Handles entering and exiting demo mode

2. **DemoModeBanner**: Banner displayed at the top of the page in demo mode
   - Indicates that demo mode is active
   - Provides option to exit demo mode

3. **DemoModeButton**: Button to enter or exit demo mode
   - Used on the homepage to enter demo mode
   - Changes appearance based on current demo mode state

4. **DemoModeIndicator**: Component displayed on the dashboard in demo mode
   - Shows demo user information
   - Provides options to reset demo data or exit demo mode

5. **DemoDashboard**: Demo version of the dashboard
   - Displays demo reports and stats
   - Used in place of the regular dashboard when in demo mode

6. **DemoReportPage**: Demo version of the report page
   - Displays and allows editing of demo reports
   - Used in place of the regular report page when in demo mode

### Server-Side Integration

- Middleware is modified to allow access to protected routes when in demo mode
- Server components check for the demo mode cookie to conditionally render demo components
- No server-side data fetching or database operations are performed in demo mode

### Data Flow

1. User enters demo mode by clicking the "Try Demo Mode" button
2. DemoContext initializes demo data and sets the demo mode cookie
3. User is redirected to the dashboard
4. Server components detect demo mode and render demo components
5. User interacts with the application as if logged in
6. All data changes are stored in localStorage via the DemoContext
7. User exits demo mode by clicking the "Exit Demo Mode" button
8. DemoContext clears the demo mode cookie
9. User is redirected to the homepage

## Security Considerations

- Demo mode does not provide access to any real user data
- No sensitive operations (e.g., account management, billing) are available in demo mode
- Demo mode is clearly indicated to prevent confusion with real account usage
- No data from demo mode is sent to the server or stored in the database

## Future Enhancements

- Add more sample reports with diverse content
- Implement AI features in demo mode with client-side mock responses
- Add guided tour functionality to highlight key features
- Allow customization of demo user profile
- Add option to export demo data to a real account upon registration
