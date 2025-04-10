import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationBadge from '@/components/notifications/NotificationBadge';

describe('NotificationBadge', () => {
  it('should render with the correct count', () => {
    render(<NotificationBadge count={5} />);
    
    const badge = screen.getByText('5');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-600'); // Check for the badge styling
  });

  it('should display "9+" for counts greater than 9', () => {
    render(<NotificationBadge count={15} />);
    
    const badge = screen.getByText('9+');
    expect(badge).toBeInTheDocument();
  });

  it('should not render when count is 0', () => {
    const { container } = render(<NotificationBadge count={0} />);
    
    // The component should return null, so the container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('should not render when count is negative', () => {
    const { container } = render(<NotificationBadge count={-1} />);
    
    // The component should return null, so the container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('should apply custom className if provided', () => {
    render(<NotificationBadge count={3} className="custom-class" />);
    
    const badge = screen.getByText('3');
    expect(badge).toHaveClass('custom-class');
  });
});
