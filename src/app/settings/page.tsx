'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Default Settings Page
 * 
 * Redirects to the profile settings page.
 */
export default function SettingsPage() {
  const router = useRouter();
  
  // Redirect to the profile settings page
  useEffect(() => {
    router.push('/settings/profile');
  }, [router]);
  
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <p className="text-gray-500 dark:text-gray-400">Redirecting to profile settings...</p>
    </div>
  );
}
