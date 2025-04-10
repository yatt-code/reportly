'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  label?: string;
  className?: string;
}

/**
 * A branded loading spinner component with customizable size and color
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label,
  className = '',
}) => {
  // Size mappings
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Color mappings
  const colorClasses = {
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-indigo-600 dark:text-indigo-400',
    white: 'text-white',
  };

  // Label size mappings
  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer spinning circle */}
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} opacity-25 animate-spin-slow rounded-full border-4 border-t-transparent border-b-transparent`}
        ></div>
        
        {/* Inner spinning circle (opposite direction) */}
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'
          } ${colorClasses[color]} opacity-75 animate-spin-reverse rounded-full border-2 border-l-transparent border-r-transparent`}
        ></div>
        
        {/* Reportly logo or initial in the center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <span className={`font-bold ${
            size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-base'
          } ${colorClasses[color]}`}>
            R
          </span>
        </div>
      </div>
      
      {/* Optional label */}
      {label && (
        <span className={`mt-2 ${labelSizeClasses[size]} ${colorClasses[color]} font-medium`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
