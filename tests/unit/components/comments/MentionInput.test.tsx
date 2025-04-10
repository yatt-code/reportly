import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MentionInput from '@/components/comments/MentionInput';
import logger from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('MentionInput', () => {
  // Mock props
  const mockProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Test placeholder',
    rows: 3,
    disabled: false,
    className: 'test-class',
  };

  // Mock API response
  const mockUsers = [
    { id: 'user1', username: 'johndoe', name: 'John Doe' },
    { id: 'user2', username: 'janedoe', name: 'Jane Doe' },
    { id: 'user3', username: 'bobsmith', name: 'Bob Smith' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ users: mockUsers }),
    });
  });

  it('should render with the provided props', () => {
    render(<MentionInput {...mockProps} />);
    
    // Check that the component renders with the correct placeholder
    const input = screen.getByPlaceholderText('Test placeholder');
    expect(input).toBeInTheDocument();
    
    // Check that the component has the correct class
    const container = input.closest('.mention-input-container');
    expect(container).toHaveClass('test-class');
  });

  it('should call onChange when the input value changes', () => {
    render(<MentionInput {...mockProps} />);
    
    // Get the input element
    const input = screen.getByPlaceholderText('Test placeholder');
    
    // Simulate typing
    fireEvent.change(input, { target: { value: 'Hello world' } });
    
    // Check that onChange was called with the new value
    expect(mockProps.onChange).toHaveBeenCalledWith('Hello world');
  });

  it('should be disabled when the disabled prop is true', () => {
    render(<MentionInput {...mockProps} disabled={true} />);
    
    // Get the input element
    const input = screen.getByPlaceholderText('Test placeholder');
    
    // Check that the input is disabled
    expect(input).toBeDisabled();
  });

  it('should fetch users when typing @', async () => {
    render(<MentionInput {...mockProps} />);
    
    // Get the input element
    const input = screen.getByPlaceholderText('Test placeholder');
    
    // Simulate typing @
    fireEvent.change(input, { target: { value: '@' } });
    
    // Wait for the API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/users-in-group');
    });
    
    // Check that the logger was called
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining('Fetching users from API for mention'),
      expect.anything()
    );
  });

  it('should use cached results for subsequent queries', async () => {
    render(<MentionInput {...mockProps} />);
    
    // Get the input element
    const input = screen.getByPlaceholderText('Test placeholder');
    
    // Simulate typing @
    fireEvent.change(input, { target: { value: '@' } });
    
    // Wait for the API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    // Reset the mock
    (global.fetch as jest.Mock).mockClear();
    
    // Simulate typing @j (should use cache)
    fireEvent.change(input, { target: { value: '@j' } });
    
    // Check that no new API call was made
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
    
    // Check that the logger was called for cache usage
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining('Using filtered cached users for query'),
      expect.anything()
    );
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    });
    
    render(<MentionInput {...mockProps} />);
    
    // Get the input element
    const input = screen.getByPlaceholderText('Test placeholder');
    
    // Simulate typing @
    fireEvent.change(input, { target: { value: '@' } });
    
    // Wait for the API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/users-in-group');
    });
    
    // Check that the logger was called with an error
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching users for mention'),
      expect.anything()
    );
  });

  it('should handle missing users in API response', async () => {
    // Mock API response with missing users
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}), // No users property
    });
    
    render(<MentionInput {...mockProps} />);
    
    // Get the input element
    const input = screen.getByPlaceholderText('Test placeholder');
    
    // Simulate typing @
    fireEvent.change(input, { target: { value: '@' } });
    
    // Wait for the API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/users-in-group');
    });
    
    // Check that the logger was called with a warning
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('API response missing users array')
    );
  });
});
