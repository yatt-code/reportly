import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LevelUpToast, { showLevelUpToast } from '@/components/xp/LevelUpToast';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  custom: jest.fn(),
}));

describe('LevelUpToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with the correct level', () => {
    render(<LevelUpToast level={5} />);

    // Check that the component renders with the correct level
    expect(screen.getByText('Level Up!')).toBeInTheDocument();
    expect(screen.getByText('You\'ve reached Level 5!')).toBeInTheDocument();

    // Check that the component has the correct styling
    const container = screen.getByText('Level Up!').closest('div').parentElement;
    expect(container).toHaveClass('bg-indigo-100');
    expect(container).toHaveClass('border-indigo-500');
  });

  it('should include a celebration emoji', () => {
    render(<LevelUpToast level={3} />);

    // Check that the component includes the celebration emoji
    const emojiElement = screen.getByText('🎉');
    expect(emojiElement).toBeInTheDocument();
  });

  it('should call toast.custom when showLevelUpToast is called', () => {
    // Call the function
    showLevelUpToast(7);

    // Verify toast.custom was called
    expect(toast.custom).toHaveBeenCalledTimes(1);

    // Verify the toast has the correct duration
    expect(toast.custom).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ duration: 5000 })
    );

    // Get the render function passed to toast.custom
    const renderFunction = (toast.custom as jest.Mock).mock.calls[0][0];

    // Call the render function with a mock toast object
    const mockToast = { visible: true };
    const result = renderFunction(mockToast);

    // Verify the render function returns a div with the correct classes
    expect(result.props.className).toContain('animate-enter');

    // Render the result to check its contents
    render(result);

    // Verify the toast content
    expect(screen.getByText('Level Up!')).toBeInTheDocument();
    expect(screen.getByText('You\'ve reached Level 7!')).toBeInTheDocument();
  });

  it('should handle animation states based on toast visibility', () => {
    // Call the function
    showLevelUpToast(3);

    // Get the render function passed to toast.custom
    const renderFunction = (toast.custom as jest.Mock).mock.calls[0][0];

    // Call the render function with a visible toast
    const visibleToast = { visible: true };
    const visibleResult = renderFunction(visibleToast);

    // Verify the visible toast has the enter animation
    expect(visibleResult.props.className).toContain('animate-enter');
    expect(visibleResult.props.className).not.toContain('animate-leave');

    // Call the render function with a hidden toast
    const hiddenToast = { visible: false };
    const hiddenResult = renderFunction(hiddenToast);

    // Verify the hidden toast has the leave animation
    expect(hiddenResult.props.className).toContain('animate-leave');
    expect(hiddenResult.props.className).not.toContain('animate-enter');
  });
});
