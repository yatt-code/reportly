import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNotifications } from '@/contexts/NotificationContext';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';

// Mock the hooks
jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/contexts/NotificationContext', () => ({
  useNotifications: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  logout: jest.fn(),
}));

// Mock ThemeToggle component
jest.mock('@/components/theme/ThemeToggle', () => {
  return function MockThemeToggle({ className }: { className?: string }) {
    return <button className={className} data-testid="theme-toggle">Theme Toggle</button>;
  };
});

// Mock NotificationDropdown component
jest.mock('@/components/notifications/NotificationDropdown', () => {
  return function MockNotificationDropdown() {
    return <div data-testid="notification-dropdown">Notifications</div>;
  };
});

describe('Navbar Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Default mock implementations
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      markAsSeen: jest.fn(),
      refetchNotifications: jest.fn(),
    });

    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('should render unauthenticated navbar correctly', () => {
    render(<Navbar />);

    // Check that the logo is rendered
    expect(screen.getByText('Reportly')).toBeInTheDocument();

    // Check that unauthenticated links are rendered
    expect(screen.getAllByText('Home')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Login')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Register')[0]).toBeInTheDocument();

    // Check that authenticated links are not rendered
    expect(screen.queryAllByText('Dashboard').length).toBe(0);
    expect(screen.queryAllByText('Reports').length).toBe(0);
    expect(screen.queryAllByText('Settings').length).toBe(0);
    expect(screen.queryAllByText('Logout').length).toBe(0);

    // Check that theme toggle is rendered
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();

    // Check that notification dropdown is not rendered
    expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
  });

  it('should render authenticated navbar correctly', () => {
    // Mock authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'test-user-id', email: 'test@example.com' },
    });

    render(<Navbar />);

    // Check that the logo is rendered
    expect(screen.getByText('Reportly')).toBeInTheDocument();

    // Check that authenticated links are rendered
    expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Reports')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Settings')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Logout')[0]).toBeInTheDocument();

    // Check that unauthenticated links are not rendered
    expect(screen.queryAllByText('Home').length).toBe(0);
    expect(screen.queryAllByText('Login').length).toBe(0);
    expect(screen.queryAllByText('Register').length).toBe(0);

    // Check that theme toggle is rendered
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();

    // Check that notification dropdown is rendered
    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
  });

  it('should toggle mobile menu when hamburger icon is clicked', () => {
    render(<Navbar />);

    // Mobile menu should be hidden initially
    expect(screen.getByText('Open menu')).toBeInTheDocument();

    // Click the hamburger icon
    fireEvent.click(screen.getByText('Open menu'));

    // Mobile menu should be visible
    expect(screen.getByText('Close menu')).toBeInTheDocument();

    // Click the close icon
    fireEvent.click(screen.getByText('Close menu'));

    // Mobile menu should be hidden again
    expect(screen.getByText('Open menu')).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', () => {
    // Mock authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'test-user-id', email: 'test@example.com' },
    });

    render(<Navbar />);

    // Click the logout button
    fireEvent.click(screen.getAllByText('Logout')[0]);

    // Check that logout was called
    expect(logout).toHaveBeenCalled();
  });
});
