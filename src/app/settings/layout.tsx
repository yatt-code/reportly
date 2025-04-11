'use client'; // This layout uses client hooks (usePathname in sidebar)

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Building, Briefcase, Shield, Bell } from 'lucide-react';

/**
 * Settings Layout Component
 * 
 * Provides a consistent layout for all settings pages with a sidebar navigation.
 */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <SettingsSidebar />
          
          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

/**
 * Settings Sidebar Component
 * 
 * Provides navigation links for different settings sections.
 */
function SettingsSidebar() {
  const pathname = usePathname();
  
  // Define settings navigation items
  const navItems = [
    {
      label: 'Profile',
      href: '/settings/profile',
      icon: User,
    },
    {
      label: 'Organization',
      href: '/settings/organization',
      icon: Building,
    },
    {
      label: 'Workspaces',
      href: '/settings/workspaces',
      icon: Briefcase,
    },
    {
      label: 'Permissions',
      href: '/settings/permissions',
      icon: Shield,
    },
    {
      label: 'Notifications',
      href: '/settings/notifications',
      icon: Bell,
    },
  ];
  
  return (
    <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Settings</h2>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
