import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationItem from '@/components/notifications/NotificationItem';
import { useRouter } from 'next/navigation';
import logger from '@/lib/utils/logger';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
jest.mock('lucide-react', () => ({
  MessageSquare: () => <div data-testid="message-square-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
}));

describe('NotificationItem', () => {
  // Mock router
  const mockRouter = {
    push: jest.fn(),
  };

  // Mock onMarkAsSeen callback
  const mockOnMarkAsSeen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render a mention notification correctly', () => {
    const mockNotification = {
      id: 'notif1',
      type: 'mention',
      userId: 'user1',
      contextId: 'comment1',
      reportId: 'report1',
      seen: false,
      createdAt: '2023-01-01T12:00:00Z',
      report: { title: 'Test Report' },
    };

    render(<NotificationItem notification={mockNotification} onMarkAsSeen={mockOnMarkAsSeen} />);

    // Check that the notification content is rendered
    expect(screen.getByText(/you were mentioned in a comment/i)).toBeInTheDocument();
    expect(screen.getByText(/on report "test report"/i)).toBeInTheDocument();

    // Check that the correct icon is rendered
    expect(screen.getByTestId('message-square-icon')).toBeInTheDocument();
  });

  it('should render a notification with missing report data', () => {
    const mockNotification = {
      id: 'notif1',
      type: 'mention',
      userId: 'user1',
      contextId: 'comment1',
      reportId: 'report1',
      seen: false,
      createdAt: '2023-01-01T12:00:00Z',
      // No report data
    };

    render(<NotificationItem notification={mockNotification} onMarkAsSeen={mockOnMarkAsSeen} />);

    // Check that the notification content is rendered without report title
    expect(screen.getByText(/you were mentioned in a comment/i)).toBeInTheDocument();
    expect(screen.queryByText(/on report/i)).not.toBeInTheDocument();
  });

  it('should render a default icon for unknown notification types', () => {
    const mockNotification = {
      id: 'notif1',
      type: 'unknown',
      userId: 'user1',
      contextId: 'comment1',
      reportId: 'report1',
      seen: false,
      createdAt: '2023-01-01T12:00:00Z',
    };

    render(<NotificationItem notification={mockNotification} onMarkAsSeen={mockOnMarkAsSeen} />);

    // Check that the default icon is rendered
    expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
  });

  it('should call onMarkAsSeen and navigate when clicked', async () => {
    const mockNotification = {
      id: 'notif1',
      type: 'mention',
      userId: 'user1',
      contextId: 'comment1',
      reportId: 'report1',
      seen: false,
      createdAt: '2023-01-01T12:00:00Z',
    };

    // Mock the onMarkAsSeen function to resolve immediately
    mockOnMarkAsSeen.mockResolvedValue(undefined);

    render(<NotificationItem notification={mockNotification} onMarkAsSeen={mockOnMarkAsSeen} />);

    // Click the notification
    await fireEvent.click(screen.getByRole('button'));

    // Should call onMarkAsSeen with the notification ID
    expect(mockOnMarkAsSeen).toHaveBeenCalledWith('notif1');

    // Should navigate to the report with the comment ID as hash
    expect(mockRouter.push).toHaveBeenCalledWith('/report/report1#comment-comment1');
  });

  it('should navigate to the report without hash if contextId is missing', async () => {
    const mockNotification = {
      id: 'notif1',
      type: 'mention',
      userId: 'user1',
      contextId: null, // No contextId
      reportId: 'report1',
      seen: false,
      createdAt: '2023-01-01T12:00:00Z',
    };

    // Mock the onMarkAsSeen function to resolve immediately
    mockOnMarkAsSeen.mockResolvedValue(undefined);

    render(<NotificationItem notification={mockNotification} onMarkAsSeen={mockOnMarkAsSeen} />);

    // Click the notification
    await fireEvent.click(screen.getByRole('button'));

    // Should navigate to the report without hash
    expect(mockRouter.push).toHaveBeenCalledWith('/report/report1');
  });

  it('should log a warning if reportId is missing', async () => {
    const mockNotification = {
      id: 'notif1',
      type: 'mention',
      userId: 'user1',
      contextId: 'comment1',
      reportId: null, // No reportId
      seen: false,
      createdAt: '2023-01-01T12:00:00Z',
    };

    // Mock the onMarkAsSeen function to resolve immediately
    mockOnMarkAsSeen.mockResolvedValue(undefined);

    // Mock the logger.warn function
    (logger.warn as jest.Mock).mockImplementation(() => {});

    render(<NotificationItem notification={mockNotification} onMarkAsSeen={mockOnMarkAsSeen} />);

    // Click the notification
    await fireEvent.click(screen.getByRole('button'));

    // Should call onMarkAsSeen
    expect(mockOnMarkAsSeen).toHaveBeenCalledWith('notif1');

    // Should not navigate
    expect(mockRouter.push).not.toHaveBeenCalled();

    // Should log a warning
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Cannot navigate'),
      expect.objectContaining({ id: 'notif1' })
    );
  });

  it('should handle errors during navigation', async () => {
    const mockNotification = {
      id: 'notif1',
      type: 'mention',
      userId: 'user1',
      contextId: 'comment1',
      reportId: 'report1',
      seen: false,
      createdAt: '2023-01-01T12:00:00Z',
    };

    // Mock the onMarkAsSeen function to resolve immediately
    mockOnMarkAsSeen.mockResolvedValue(undefined);

    // Mock the logger.error function
    (logger.error as jest.Mock).mockImplementation(() => {});

    // Mock router.push to throw an error
    mockRouter.push.mockImplementation(() => {
      throw new Error('Navigation error');
    });

    render(<NotificationItem notification={mockNotification} onMarkAsSeen={mockOnMarkAsSeen} />);

    // Click the notification
    await fireEvent.click(screen.getByRole('button'));

    // Should call onMarkAsSeen
    expect(mockOnMarkAsSeen).toHaveBeenCalledWith('notif1');

    // Should log an error
    expect(logger.error).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error marking notification as seen or navigating'),
      expect.any(Error)
    );
  });
});
