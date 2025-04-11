#### Manual Test Script for Gamification

**Prerequisites:**
- A test user account
- Access to the database to verify XP changes (optional)

**Test 1: XP Gain from Creating a Report**
1. Log in to the application with the test user account
2. Note the current XP and level displayed in the user profile or stats panel
3. Create a new report with a title and content
4. Verify that:
   - A success message appears
   - The XP counter increases by the expected amount (25 XP)
   - If the XP gain causes a level-up, verify the level-up toast appears

**Test 2: XP Gain from Posting Comments**
1. Log in to the application with the test user account
2. Note the current XP and level
3. Navigate to an existing report
4. Post a new comment
5. Verify that:
   - The comment appears in the report
   - The XP counter increases by the expected amount (10 XP)
   - If the XP gain causes a level-up, verify the level-up toast appears

**Test 3: Achievement Unlocking**
1. Log in with a new test user account (to ensure no achievements are already unlocked)
2. Perform actions that should trigger achievements:
   - Create first report (should trigger "First Report" achievement)
   - Post first comment (should trigger "First Comment" achievement)
   - Complete profile information (should trigger profile completion achievement)
3. Verify that:
   - Achievement notifications appear
   - Achievements are visible in the user's achievement list/panel
   - Each achievement is only awarded once (repeat actions to confirm)

**Test 4: Level-Up Experience**
1. Create a test user with XP just below a level threshold (e.g., 95 XP if level 2 starts at 100 XP)
2. Perform an action that grants enough XP to level up (e.g., post a comment for +10 XP)
3. Verify that:
   - The level-up toast appears with the correct new level
   - The user's profile shows the updated level
   - The XP progress bar resets appropriately for the new level

**Test 5: XP Progress Bar**
1. Log in with a test user
2. Navigate to the user stats panel or profile
3. Verify that:
   - The XP progress bar accurately reflects progress toward the next level
   - The display shows current XP and XP needed for next level
   - The percentage filled matches the calculation: (current XP - XP for current level) / (XP for next level - XP for current level)