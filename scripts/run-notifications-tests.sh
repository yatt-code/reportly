#!/bin/bash

# Run all Notification tests
echo "Running all Notification tests..."
echo "--------------------------------"

# NotificationBadge tests
echo "\n🧪 Running NotificationBadge tests..."
npm test -- tests/unit/components/notifications/NotificationBadge.test.tsx

# NotificationContext tests
echo "\n🧪 Running NotificationContext tests..."
npm test -- tests/unit/contexts/NotificationContext.test.tsx

# NotificationDropdown tests
echo "\n🧪 Running NotificationDropdown tests..."
npm test -- tests/unit/components/notifications/NotificationDropdown.test.tsx

# NotificationItem tests
echo "\n🧪 Running NotificationItem tests..."
npm test -- tests/unit/components/notifications/NotificationItem.test.tsx

# getNotifications tests
echo "\n🧪 Running getNotifications tests..."
npm test -- tests/unit/app/actions/notifications/getNotifications.test.ts

# markNotificationAsSeen tests
echo "\n🧪 Running markNotificationAsSeen tests..."
npm test -- tests/unit/app/actions/notifications/markNotificationAsSeen.test.ts

echo "\n✅ All Notification tests completed!"
