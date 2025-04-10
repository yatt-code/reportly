import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportList from '@/components/dashboard/ReportList';
import { ReportListItemData } from '@/lib/schemas/reportSchemas';

// Mock the ReportListItem component to avoid dependencies
jest.mock('@/components/dashboard/ReportListItem', () => {
  return function MockReportListItem({ report }) {
    return (
      <div data-testid={`report-item-${report.id}`}>
        <h3>{report.title}</h3>
        <p>Status: {report.status}</p>
      </div>
    );
  };
});

// Mock the AuthProvider
jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com', role: 'developer' },
    isLoading: false,
    error: null,
  }),
}));

describe('ReportList Component', () => {
  // Mock report data
  const mockReports: ReportListItemData[] = Array.from({ length: 10 }, (_, i) => ({
    id: `report-${i + 1}`,
    title: `Test Report ${i + 1}`,
    status: i % 2 === 0 ? 'Complete' : 'Draft',
    createdAt: new Date(2023, 0, i + 1),
    sentimentTags: ['tag1', 'tag2'],
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });



  it('should render the initial reports correctly', () => {
    // Render with 5 initial reports
    render(<ReportList initialReports={mockReports.slice(0, 5)} />);

    // Check that the component renders the correct number of reports
    expect(screen.getAllByTestId(/report-item-/)).toHaveLength(5);

    // Check that the first report is rendered
    expect(screen.getByText('Test Report 1')).toBeInTheDocument();

    // Check that the fifth report is rendered
    expect(screen.getByText('Test Report 5')).toBeInTheDocument();
  });

  it('should display a message when no reports are available', () => {
    // Render with no reports
    render(<ReportList initialReports={[]} />);

    // Check that the "No reports found" message is displayed
    expect(screen.getByText('No reports found.')).toBeInTheDocument();
  });
});
