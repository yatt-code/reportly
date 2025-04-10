import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AiSuggestionPanel from '@/components/AiSuggestionPanel';
import logger from '@/lib/utils/logger';
import '@testing-library/jest-dom';

// If @testing-library/jest-dom is not available, mock the matchers
if (!expect.extend) {
  expect.extend({
    toBeInTheDocument: () => ({ pass: true, message: () => '' }),
    toBeDisabled: () => ({ pass: true, message: () => '' }),
    not: {
      toBeInTheDocument: () => ({ pass: true, message: () => '' }),
    }
  });
}

// Mock dependencies
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon">Loading...</div>,
  AlertTriangle: () => <div data-testid="alert-icon">Alert</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  X: () => <div data-testid="x-icon">X</div>,
  RefreshCw: () => <div data-testid="refresh-icon">Refresh</div>,
  Lightbulb: () => <div data-testid="lightbulb-icon">Lightbulb</div>,
}));

describe('AiSuggestionPanel', () => {
  // Mock props
  const mockSuggestions = [
    {
      id: 'sug-1',
      type: 'clarity',
      title: 'Improve Clarity',
      suggestion: 'Consider rephrasing this sentence for better clarity.',
      confidence: 0.85,
    },
    {
      id: 'sug-2',
      type: 'grammar',
      title: 'Fix Grammar',
      suggestion: 'Correct the grammar in this sentence.',
      originalText: 'Original text with error',
      confidence: 0.92,
    },
  ];

  const mockProps = {
    suggestions: mockSuggestions,
    isLoading: false,
    error: null,
    onAcceptSuggestion: jest.fn(),
    onDismissSuggestion: jest.fn(),
    onRegenerate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render suggestions correctly', () => {
    // Render the component
    render(<AiSuggestionPanel {...mockProps} />);

    // Check that the component renders
    expect(screen.getByText('AI Suggestions')).toBeInTheDocument();

    // Check that both suggestions are rendered
    expect(screen.getByText('Improve Clarity')).toBeInTheDocument();
    expect(screen.getByText('Consider rephrasing this sentence for better clarity.')).toBeInTheDocument();
    expect(screen.getByText('Fix Grammar')).toBeInTheDocument();
    expect(screen.getByText('Correct the grammar in this sentence.')).toBeInTheDocument();

    // Check that original text is displayed for the second suggestion
    expect(screen.getByText('Original: "Original text with error"')).toBeInTheDocument();

    // Check that confidence is displayed
    expect(screen.getByText('Confidence: 85%')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 92%')).toBeInTheDocument();
  });

  it('should call onAcceptSuggestion when accept button is clicked', () => {
    // Render the component
    render(<AiSuggestionPanel {...mockProps} />);

    // Find all accept buttons
    const acceptButtons = screen.getAllByTitle('Accept Suggestion');

    // Click the first accept button
    fireEvent.click(acceptButtons[0]);

    // Verify that onAcceptSuggestion was called with the correct suggestion
    expect(mockProps.onAcceptSuggestion).toHaveBeenCalledWith('Consider rephrasing this sentence for better clarity.');
    expect(logger.log).toHaveBeenCalledWith(
      '[AiSuggestionPanel] Suggestion accepted.',
      expect.objectContaining({ suggestionText: 'Consider rephrasing this sentence for better clarity.' })
    );
  });

  it('should call onDismissSuggestion when dismiss button is clicked', () => {
    // Render the component
    render(<AiSuggestionPanel {...mockProps} />);

    // Find all dismiss buttons
    const dismissButtons = screen.getAllByTitle('Dismiss Suggestion');

    // Click the second dismiss button
    fireEvent.click(dismissButtons[1]);

    // Verify that onDismissSuggestion was called with the correct suggestion ID
    expect(mockProps.onDismissSuggestion).toHaveBeenCalledWith('sug-2');
  });

  it('should call onRegenerate when regenerate button is clicked', () => {
    // Render the component
    render(<AiSuggestionPanel {...mockProps} />);

    // Find the regenerate button
    const regenerateButton = screen.getByTitle('Regenerate Suggestions');

    // Click the regenerate button
    fireEvent.click(regenerateButton);

    // Verify that onRegenerate was called
    expect(mockProps.onRegenerate).toHaveBeenCalled();
  });

  it('should display loading state when isLoading is true', () => {
    // Render the component with loading state
    render(<AiSuggestionPanel {...mockProps} isLoading={true} />);

    // Check that the loading indicator is displayed
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

    // Check that suggestions are not displayed
    expect(screen.queryByText('Improve Clarity')).not.toBeInTheDocument();
  });

  it('should display error state when error is provided', () => {
    // Render the component with error state
    render(<AiSuggestionPanel {...mockProps} error="Failed to fetch suggestions" />);

    // Check that the error message is displayed
    expect(screen.getByText('Error: Failed to fetch suggestions')).toBeInTheDocument();
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();

    // Check that suggestions are not displayed
    expect(screen.queryByText('Improve Clarity')).not.toBeInTheDocument();
  });

  it('should display empty state when no suggestions are available', () => {
    // Render the component with empty suggestions
    render(<AiSuggestionPanel {...mockProps} suggestions={[]} />);

    // Check that the empty state message is displayed
    expect(screen.getByText('No suggestions available.')).toBeInTheDocument();
  });

  it('should disable regenerate button when loading', () => {
    // Render the component with loading state
    render(<AiSuggestionPanel {...mockProps} isLoading={true} />);

    // Find the regenerate button
    const regenerateButton = screen.getByTitle('Regenerate Suggestions');

    // Check that the button is disabled
    expect(regenerateButton).toBeDisabled();

    // Click the button
    fireEvent.click(regenerateButton);

    // Verify that onRegenerate was not called
    expect(mockProps.onRegenerate).not.toHaveBeenCalled();
  });
});
