import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserStatsPanel from '@/components/xp/UserStatsPanel';

// Mock the child components
jest.mock('@/components/xp/LevelBadge', () => {
  return function MockLevelBadge({ level }: { level: number }) {
    return <div data-testid="level-badge">Level {level}</div>;
  };
});

jest.mock('@/components/xp/XpProgressBar', () => {
  return function MockXpProgressBar({ xp, level }: { xp: number; level: number }) {
    return <div data-testid="xp-progress-bar">XP: {xp}, Level: {level}</div>;
  };
});

describe('UserStatsPanel Component', () => {
  it('should render with the correct XP and level', () => {
    // Render the component with XP and level
    render(<UserStatsPanel xp={250} level={3} />);

    // Check that the title is displayed
    expect(screen.getByText('Your Stats')).toBeInTheDocument();

    // Check that the LevelBadge is rendered with the correct level
    expect(screen.getByTestId('level-badge')).toHaveTextContent('Level 3');

    // Check that the XpProgressBar is rendered with the correct XP and level
    expect(screen.getByTestId('xp-progress-bar')).toHaveTextContent('XP: 250, Level: 3');

    // Check that the Total XP is displayed correctly
    expect(screen.getByText('Total XP')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('should render with the correct achievement count', () => {
    // Render the component with achievements
    render(<UserStatsPanel xp={100} level={2} achievementCount={5} />);

    // Check that the Achievements count is displayed correctly
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render with default achievement count of 0 when not provided', () => {
    // Render the component without specifying achievementCount
    render(<UserStatsPanel xp={100} level={2} />);

    // Check that the Achievements count defaults to 0
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    // Render the component with a custom className
    const { container } = render(
      <UserStatsPanel xp={100} level={2} className="custom-class" />
    );

    // Check that the custom class is applied to the container
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render with the correct styling', () => {
    // Render the component
    const { container } = render(<UserStatsPanel xp={100} level={2} />);

    // Check that the container has the correct base styling
    expect(container.firstChild).toHaveClass('p-4');
    expect(container.firstChild).toHaveClass('bg-white');
    expect(container.firstChild).toHaveClass('rounded-lg');
    expect(container.firstChild).toHaveClass('shadow');

    // Check that the XP value has the correct color
    const xpValue = screen.getByText('100');
    expect(xpValue).toHaveClass('text-indigo-600');

    // Check that the Achievements value has the correct color
    const achievementsValue = screen.getByText('0');
    expect(achievementsValue).toHaveClass('text-amber-600');
  });
});
