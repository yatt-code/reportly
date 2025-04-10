import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeToggle from '@/components/theme/ThemeToggle';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock document.documentElement.classList
const classListMock = {
  add: jest.fn(),
  remove: jest.fn(),
};

Object.defineProperty(document.documentElement, 'classList', {
  value: classListMock,
});

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should render with light mode by default', () => {
    render(<ThemeToggle />);

    // Check that the button is rendered
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Check that the Sun icon is visible (light mode)
    const sunIcon = screen.getByTitle('Switch to dark mode');
    expect(sunIcon).toBeInTheDocument();
  });

  it('should toggle theme when clicked', () => {
    render(<ThemeToggle />);

    // Get the button
    const button = screen.getByRole('button');

    // Click the button to toggle to dark mode
    fireEvent.click(button);

    // Check that dark mode class was added
    expect(classListMock.add).toHaveBeenCalledWith('dark');

    // Check that localStorage was updated
    expect(localStorageMock.getItem('theme')).toBe('dark');

    // Click the button again to toggle back to light mode
    fireEvent.click(button);

    // Check that dark mode class was removed
    expect(classListMock.remove).toHaveBeenCalledWith('dark');

    // Check that localStorage was updated
    expect(localStorageMock.getItem('theme')).toBe('light');
  });

  it('should initialize with dark mode if stored in localStorage', () => {
    // Set localStorage to dark mode
    localStorageMock.setItem('theme', 'dark');

    render(<ThemeToggle />);

    // Check that dark mode class was added
    expect(classListMock.add).toHaveBeenCalledWith('dark');

    // Check that the Moon icon is visible (dark mode)
    const moonIcon = screen.getByTitle('Switch to light mode');
    expect(moonIcon).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    render(<ThemeToggle className="custom-class" />);

    // Check that the custom class is applied
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
