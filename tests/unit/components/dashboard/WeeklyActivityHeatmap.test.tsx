import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeeklyActivityHeatmap from '@/components/dashboard/WeeklyActivityHeatmap';
import { MockHeatmapData } from '@/lib/mockData';

describe('WeeklyActivityHeatmap Component', () => {
  // Helper function to create mock heatmap data
  const createMockHeatmapData = (counts: number[]): MockHeatmapData[] => {
    const today = new Date();
    return counts.map((count, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index)); // Last 7 days, with index 6 being today
      return {
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        count,
      };
    });
  };

  it('should render 7 days of heatmap data', () => {
    // Create mock data with 7 days
    const mockData = createMockHeatmapData([0, 1, 2, 3, 4, 2, 1]);

    // Render the component
    render(<WeeklyActivityHeatmap heatmapData={mockData} />);

    // Check that the component renders the correct title
    expect(screen.getByText('Weekly Activity')).toBeInTheDocument();

    // Check that 7 heatmap cells are rendered
    const heatmapCells = screen.getAllByTitle(/\d{4}-\d{2}-\d{2}: \d+ report\(s\)/);
    expect(heatmapCells).toHaveLength(7);
  });

  it('should apply the correct color based on the count', () => {
    // Create mock data with different counts
    const mockData = createMockHeatmapData([0, 1, 2, 3, 4, 0, 1]);

    // Render the component
    render(<WeeklyActivityHeatmap heatmapData={mockData} />);

    // Get all heatmap cells
    const heatmapCells = screen.getAllByTitle(/\d{4}-\d{2}-\d{2}: \d+ report\(s\)/);

    // Check that the cells have the correct background colors
    // Cell with count 0
    expect(heatmapCells[0]).toHaveClass('bg-gray-100');

    // Cell with count 1
    expect(heatmapCells[1]).toHaveClass('bg-green-200');

    // Cell with count 2
    expect(heatmapCells[2]).toHaveClass('bg-green-400');

    // Cell with count 3
    expect(heatmapCells[3]).toHaveClass('bg-green-400');

    // Cell with count 4
    expect(heatmapCells[4]).toHaveClass('bg-green-600');
  });

  it('should display the correct date information in tooltips', () => {
    // Create mock data with specific dates and counts
    const mockData = createMockHeatmapData([1, 2, 3, 0, 1, 2, 4]);

    // Render the component
    render(<WeeklyActivityHeatmap heatmapData={mockData} />);

    // Get all heatmap cells
    const heatmapCells = screen.getAllByTitle(/\d{4}-\d{2}-\d{2}: \d+ report\(s\)/);

    // Check that each cell has the correct tooltip with date and count
    mockData.forEach((data, index) => {
      expect(heatmapCells[index]).toHaveAttribute(
        'title',
        `${data.date}: ${data.count} report(s)`
      );
    });
  });

  it('should handle less than 7 days of data by showing only available days', () => {
    // Create mock data with only 3 days
    const mockData = createMockHeatmapData([1, 2, 3, 0, 1]).slice(2); // Only 3 days

    // Render the component
    render(<WeeklyActivityHeatmap heatmapData={mockData} />);

    // Check that only 3 heatmap cells are rendered
    const heatmapCells = screen.getAllByTitle(/\d{4}-\d{2}-\d{2}: \d+ report\(s\)/);
    expect(heatmapCells).toHaveLength(3);
  });

  it('should show the legend with color indicators', () => {
    // Create mock data
    const mockData = createMockHeatmapData([0, 1, 2, 3, 4, 0, 1]);

    // Render the component
    render(<WeeklyActivityHeatmap heatmapData={mockData} />);

    // Check that the legend is displayed
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();

    // Check that the legend section exists
    const legendSection = screen.getByText('Less').closest('div');
    expect(legendSection).toHaveClass('flex');
    expect(legendSection).toHaveClass('justify-end');
  });
});
