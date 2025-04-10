import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationProvider, useNotifications } from '@/contexts/NotificationContext';
import { getNotifications } from '@/app/actions/notifications/getNotifications';
import { markNotificationAsSeen } from '@/app/actions/notifications/markNotificationAsSeen';
import { useAuth } from '@/components/auth/AuthProvider';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/app/actions/notifications/getNotifications');
jest.mock('@/app/actions/notifications/markNotificationAsSeen');
jest.mock('@/components/auth/AuthProvider');
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));
jest.mock('react-hot-toast');

// Test component that uses the notification context
const TestComponent = () => {
  const { notifications, unreadCount, isLoading, error, markAsSeen, refetchNotifications } = useNotifications();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading...' : 'Not loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="count">{unreadCount}</div>
      <ul data-testid="notifications">
        {notifications.map(n => (
          <li key={n.id} data-testid={`notification-${n.id}`}>
            {n.type} - {n.id}
            <button onClick={() => markAsSeen(n.id)}>Mark as seen</button>
          </li>
        ))}
      </ul>
      <button data-testid="refetch" onClick={refetchNotifications}>Refetch</button>
    </div>
  );
};

describe('NotificationContext', () => {
  // Mock notification data
  const mockNotifications = [
    { id: 'notif1', type: 'mention', userId: 'user1', contextId: 'context1', reportId: 'report1', seen: false, createdAt: '2023-01-01' },
    { id: 'notif2', type: 'mention', userId: 'user1', contextId: 'context2', reportId: 'report2', seen: false, createdAt: '2023-01-02' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useAuth to return authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock getNotifications to return success with mock data
    (getNotifications as jest.Mock).mockResolvedValue({
      success: true,
      notifications: mockNotifications,
    });

    // Mock markNotificationAsSeen to return success
    (markNotificationAsSeen as jest.Mock).mockResolvedValue({
      success: true,
    });
  });

  it('should fetch notifications on mount when authenticated', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Initially should show loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');

    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Should have called getNotifications
    expect(getNotifications).toHaveBeenCalledTimes(1);

    // Should display the correct count
    expect(screen.getByTestId('count')).toHaveTextContent('2');

    // Should display the notifications
    expect(screen.getByTestId('notifications').children).toHaveLength(2);
    expect(screen.getByTestId('notification-notif1')).toBeInTheDocument();
    expect(screen.getByTestId('notification-notif2')).toBeInTheDocument();
  });

  it('should not fetch notifications when not authenticated', async () => {
    // Mock useAuth to return unauthenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Wait for component to finish rendering
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Should not have called getNotifications
    expect(getNotifications).not.toHaveBeenCalled();

    // Should display 0 count
    expect(screen.getByTestId('count')).toHaveTextContent('0');

    // Should not display any notifications
    expect(screen.getByTestId('notifications').children).toHaveLength(0);
  });

  it('should handle errors when fetching notifications', async () => {
    // Mock getNotifications to return error
    (getNotifications as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Failed to fetch notifications',
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Wait for component to finish rendering
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Should display the error
    expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch notifications');

    // Should display 0 count
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('should optimistically update state when marking a notification as seen', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByTestId('notifications').children).toHaveLength(2);
    });

    // Click the "Mark as seen" button for the first notification
    const markAsSeenButton = screen.getAllByText('Mark as seen')[0];
    act(() => {
      markAsSeenButton.click();
    });

    // Should have called markNotificationAsSeen
    expect(markNotificationAsSeen).toHaveBeenCalledWith('notif1');

    // Should have optimistically removed the notification from the list
    await waitFor(() => {
      expect(screen.getByTestId('notifications').children).toHaveLength(1);
      expect(screen.queryByTestId('notification-notif1')).not.toBeInTheDocument();
      expect(screen.getByTestId('notification-notif2')).toBeInTheDocument();
    });

    // Should have updated the count
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('should revert optimistic update if marking as seen fails', async () => {
    // Mock toast.error function
    (toast.error as jest.Mock).mockImplementation(() => {});

    // Mock markNotificationAsSeen to return error
    (markNotificationAsSeen as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Failed to mark as seen',
    });

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Wait for notifications to load
    await waitFor(() => {
      expect(screen.getByTestId('notifications').children).toHaveLength(2);
    });

    // Click the "Mark as seen" button for the first notification
    const markAsSeenButton = screen.getAllByText('Mark as seen')[0];

    // Use act to wrap the async operation
    await act(async () => {
      markAsSeenButton.click();
      // Wait a bit for the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should have called markNotificationAsSeen
    expect(markNotificationAsSeen).toHaveBeenCalledWith('notif1');

    // Should have shown an error toast
    expect(toast.error).toHaveBeenCalled();

    // Should have refetched notifications to revert the optimistic update
    expect(getNotifications).toHaveBeenCalledTimes(2);
  });

  it('should refetch notifications when refetchNotifications is called', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Wait for initial notifications to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Reset the mock to track new calls
    (getNotifications as jest.Mock).mockClear();

    // Click the refetch button
    const refetchButton = screen.getByTestId('refetch');
    act(() => {
      refetchButton.click();
    });

    // Should show loading again
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');

    // Should have called getNotifications again
    await waitFor(() => {
      expect(getNotifications).toHaveBeenCalledTimes(1);
    });
  });
});
