'use client';

import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { useAuth } from '@/components/auth/AuthProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface MainLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

/**
 * Main layout component that wraps the application content
 * Includes the navbar and handles authentication loading state
 */
const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showNavbar = true 
}) => {
  const { isLoading } = useAuth();

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <LoadingSpinner size="xl" label="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar */}
      {showNavbar && <Navbar />}
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer could be added here */}
    </div>
  );
};

export default MainLayout;
