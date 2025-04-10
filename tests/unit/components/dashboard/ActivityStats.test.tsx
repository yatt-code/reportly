import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityStats from '@/components/dashboard/ActivityStats';
import { MockActivityStats } from '@/lib/mockData';

describe('ActivityStats Component', () => {
  it('should render daily streak and reports this week correctly', () => {
    // Mock activity stats
    const mockStats: MockActivityStats = {
      dailyStreak: 3,
      reportsThisWeek: 5,
    };

    // Render the component
    render(<ActivityStats stats={mockStats} />);

    // Check that the daily streak is displayed correctly
    expect(screen.getByText('Daily Streak')).toBeInTheDocument();
    expect(screen.getByText('3 Days')).toBeInTheDocument();

    // Check that the reports this week is displayed correctly
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('5 Reports')).toBeInTheDocument();
  });

  it('should handle singular form correctly', () => {
    // Mock activity stats with singular values
    const mockStats: MockActivityStats = {
      dailyStreak: 1,
      reportsThisWeek: 1,
    };

    // Render the component
    render(<ActivityStats stats={mockStats} />);

    // Check that the singular form is used
    expect(screen.getByText('1 Day')).toBeInTheDocument();
    expect(screen.getByText('1 Report')).toBeInTheDocument();
  });

  it('should handle zero values correctly', () => {
    // Mock activity stats with zero values
    const mockStats: MockActivityStats = {
      dailyStreak: 0,
      reportsThisWeek: 0,
    };

    // Render the component
    render(<ActivityStats stats={mockStats} />);

    // Check that the plural form is used for zero
    expect(screen.getByText('0 Days')).toBeInTheDocument();
    expect(screen.getByText('0 Reports')).toBeInTheDocument();
  });

  it('should render with the correct icons', () => {
    // Mock activity stats
    const mockStats: MockActivityStats = {
      dailyStreak: 3,
      reportsThisWeek: 5,
    };

    // Render the component
    render(<ActivityStats stats={mockStats} />);

    // Check that the icons have the correct classes
    const flameIcon = screen.getByText('Daily Streak').closest('div')?.previousSibling;
    expect(flameIcon).toHaveClass('text-orange-500');

    const chartIcon = screen.getByText('This Week').closest('div')?.previousSibling;
    expect(chartIcon).toHaveClass('text-blue-500');
  });
});
