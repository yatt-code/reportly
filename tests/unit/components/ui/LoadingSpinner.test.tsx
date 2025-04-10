import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />);

    // Check that the spinner is rendered
    const spinner = screen.getByText('R');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with label when provided', () => {
    render(<LoadingSpinner label="Loading data..." />);

    // Check that the label is rendered
    const label = screen.getByText('Loading data...');
    expect(label).toBeInTheDocument();
  });

  it('should render with different sizes', () => {
    // Just verify that rendering with different sizes doesn't throw errors
    expect(() => render(<LoadingSpinner size="sm" />)).not.toThrow();
    expect(() => render(<LoadingSpinner size="md" />)).not.toThrow();
    expect(() => render(<LoadingSpinner size="lg" />)).not.toThrow();
    expect(() => render(<LoadingSpinner size="xl" />)).not.toThrow();
  });

  it('should render with different colors', () => {
    // Just verify that rendering with different colors doesn't throw errors
    expect(() => render(<LoadingSpinner color="primary" />)).not.toThrow();
    expect(() => render(<LoadingSpinner color="secondary" />)).not.toThrow();
    expect(() => render(<LoadingSpinner color="white" />)).not.toThrow();
  });
});
