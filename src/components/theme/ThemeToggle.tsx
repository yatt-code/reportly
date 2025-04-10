'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * ThemeToggle component with smooth animations and transitions
 * Provides a visually appealing way to switch between light and dark themes
 */
const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  // State to track the current theme
  const [isDarkMode, setIsDarkMode] = useState(false);
  // State for the animation
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize theme from localStorage or system preference on mount
  useEffect(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme === 'dark' || 
        (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle theme function with animation
  const toggleTheme = () => {
    setIsAnimating(true);
    
    // Toggle dark mode state
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      
      // Update localStorage
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      
      // Update document class for Tailwind
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return newMode;
    });
    
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <button
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className={`relative p-2 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        isDarkMode 
          ? 'bg-indigo-900/20 text-yellow-300 hover:bg-indigo-800/30' 
          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      } ${className}`}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        {/* Sun icon with animation */}
        <Sun 
          className={`absolute transform transition-all duration-500 ease-spring ${
            isDarkMode 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
          } ${isAnimating ? 'animate-spin-slow' : ''}`} 
          size={20} 
        />
        
        {/* Moon icon with animation */}
        <Moon 
          className={`absolute transform transition-all duration-500 ease-spring ${
            isDarkMode 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
          } ${isAnimating ? 'animate-bounce-small' : ''}`} 
          size={20} 
        />
      </div>
      
      {/* Visual indicator for screen readers */}
      <span className="sr-only">{isDarkMode ? 'Dark mode active' : 'Light mode active'}</span>
    </button>
  );
};

export default ThemeToggle;
