import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import DemoDashboard from '@/components/demo/DemoDashboard';
import { cookies } from 'next/headers';

/**
 * Dashboard layout component.
 * Wraps all dashboard pages with the MainLayout component.
 * Conditionally renders the demo dashboard if in demo mode.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if in demo mode using cookies
  const cookieStore = cookies();
  const isDemoMode = cookieStore.get('reportly_demo_mode')?.value === 'true';

  return (
    <MainLayout>
      {/* Render the demo dashboard if in demo mode, otherwise render the normal dashboard */}
      {isDemoMode ? <DemoDashboard /> : children}
    </MainLayout>
  );
}
