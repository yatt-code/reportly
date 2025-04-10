import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { useNotifications } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/contexts/NotificationContext');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock NotificationItem component
jest.mock('@/components/notifications/NotificationItem', () => {
  return function MockNotificationItem({ notification, onMarkAsSeen }) {
    return (
      <div data-testid={`notification-item-${notification.id}`}>
        {notification.type} - {notification.id}
        <button
          data-testid={`mark-seen-${notification.id}`}
          onClick={() => onMarkAsSeen(notification.id)}
        >
          Mark as seen
        </button>
      </div>
    );
  };
});

// Mock NotificationSkeleton component
jest.mock('@/components/notifications/NotificationSkeleton', () => {
  return function MockNotificationSkeleton() {
    return <div data-testid="notification-skeleton"></div>;
  };
});

describe('NotificationDropdown', () => {
  // Mock notification data
  const mockNotifications = [
    { id: 'notif1', type: 'mention', userId: 'user1', contextId: 'context1', reportId: 'report1', seen: false, createdAt: '2023-01-01' },
    { id: 'notif2', type: 'mention', userId: 'user1', contextId: 'context2', reportId: 'report2', seen: false, createdAt: '2023-01-02' },
  ];

  // Mock router
  const mockRouter = {
    push: jest.fn(),
  };

  // Mock notification context
  const mockMarkAsSeen = jest.fn();
  const mockRefetchNotifications = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup useRouter mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Setup useNotifications mock with default values
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: mockNotifications,
      unreadCount: mockNotifications.length,
      isLoading: false,
      error: null,
      markAsSeen: mockMarkAsSeen,
      refetchNotifications: mockRefetchNotifications,
    });
  });

  it('should render the bell icon with badge showing correct count', () => {
    render(<NotificationDropdown />);

    // Check that the bell icon is rendered
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    expect(bellButton).toBeInTheDocument();

    // Check that the badge is rendered with the correct count
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
  });

  it('should open the dropdown when the bell icon is clicked', () => {
    render(<NotificationDropdown />);

    // Initially, the dropdown should be closed
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();

    // Click the bell icon
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    // The dropdown should now be open
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    // Notification items should be rendered
    expect(screen.getByTestId('notification-item-notif1')).toBeInTheDocument();
    expect(screen.getByTestId('notification-item-notif2')).toBeInTheDocument();
  });

  it('should close the dropdown when clicking outside', () => {
    render(
      <div>
        <NotificationDropdown />
        <div data-testid="outside">Outside</div>
      </div>
    );

    // Open the dropdown
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    // The dropdown should be open
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    // Click outside the dropdown
    const outsideElement = screen.getByTestId('outside');
    fireEvent.mouseDown(outsideElement);

    // The dropdown should now be closed
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('should call markAsSeen when a notification is marked as seen', async () => {
    render(<NotificationDropdown />);

    // Open the dropdown
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    // Click the "Mark as seen" button for the first notification
    const markAsSeenButton = screen.getByTestId('mark-seen-notif1');
    fireEvent.click(markAsSeenButton);

    // Should have called markAsSeen with the correct ID
    expect(mockMarkAsSeen).toHaveBeenCalledWith('notif1');
  });

  it('should show loading state when notifications are loading', () => {
    // Mock loading state
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: true,
      error: null,
      markAsSeen: mockMarkAsSeen,
      refetchNotifications: mockRefetchNotifications,
    });

    render(<NotificationDropdown />);

    // Open the dropdown
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    // Should show loading skeletons
    const skeletons = screen.getAllByTestId('notification-skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('should show error state when there is an error', () => {
    // Mock error state
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: 'Failed to fetch notifications',
      markAsSeen: mockMarkAsSeen,
      refetchNotifications: mockRefetchNotifications,
    });

    render(<NotificationDropdown />);

    // Open the dropdown
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    // Should show error message
    expect(screen.getByText(/error:/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to fetch notifications/i)).toBeInTheDocument();
  });

  it('should show empty state when there are no notifications', () => {
    // Mock empty state
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      markAsSeen: mockMarkAsSeen,
      refetchNotifications: mockRefetchNotifications,
    });

    render(<NotificationDropdown />);

    // Open the dropdown
    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    // Should show empty message
    expect(screen.getByText(/no unread notifications/i)).toBeInTheDocument();
  });
});
