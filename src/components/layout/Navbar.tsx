'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { Menu, X, FileText, Home, Settings, LogOut, User } from 'lucide-react';
import { logout } from '@/lib/auth';

/**
 * Main navigation bar component with responsive design and theme toggle
 */
const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    // Redirect is handled by middleware
  };
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };
  
  // Close mobile menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  // Check if a link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };
  
  // Navigation links based on authentication status
  const navLinks = isAuthenticated
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/reports', label: 'Reports', icon: FileText },
        { href: '/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { href: '/', label: 'Home', icon: Home },
        { href: '/login', label: 'Login', icon: User },
        { href: '/register', label: 'Register', icon: User },
      ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href={isAuthenticated ? '/dashboard' : '/'} 
                className="text-xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300"
              >
                Reportly
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive(href)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="mr-1.5 h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right side items */}
          <div className="flex items-center">
            {/* Theme toggle */}
            <ThemeToggle className="mr-2" />
            
            {/* Notifications (only for authenticated users) */}
            {isAuthenticated && (
              <div className="ml-2 mr-2">
                <NotificationDropdown />
              </div>
            )}
            
            {/* Logout button (only for authenticated users) */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center px-3 py-2 ml-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </button>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1 px-4">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                isActive(href)
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              onClick={closeMenu}
            >
              <Icon className="mr-3 h-5 w-5" />
              {label}
            </Link>
          ))}
          
          {/* Logout in mobile menu (only for authenticated users) */}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
