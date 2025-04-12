'use client';

import React from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { Beaker } from 'lucide-react';

interface DemoModeButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Button component to enter or exit demo mode.
 */
const DemoModeButton: React.FC<DemoModeButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  className = '' 
}) => {
  const { isDemoMode, enterDemoMode, exitDemoMode } = useDemo();

  // Base styles
  const baseStyles = "flex items-center justify-center gap-2 font-medium transition-colors duration-200";
  
  // Size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
  
  // Variant styles
  const variantStyles = {
    primary: isDemoMode 
      ? "bg-red-600 hover:bg-red-700 text-white" 
      : "bg-green-600 hover:bg-green-700 text-white",
    secondary: isDemoMode
      ? "bg-red-100 hover:bg-red-200 text-red-800 border border-red-300"
      : "bg-green-100 hover:bg-green-200 text-green-800 border border-green-300",
    text: isDemoMode
      ? "text-red-600 hover:text-red-800 hover:bg-red-50"
      : "text-green-600 hover:text-green-800 hover:bg-green-50",
  };
  
  // Combine styles
  const buttonStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  return (
    <button
      onClick={isDemoMode ? exitDemoMode : enterDemoMode}
      className={buttonStyles}
    >
      <Beaker size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      {isDemoMode ? 'Exit Demo Mode' : 'Try Demo Mode'}
    </button>
  );
};

export default DemoModeButton;
