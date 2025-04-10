import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

/**
 * Dashboard layout component.
 * Wraps all dashboard pages with the MainLayout component.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
