'use client';

import React, { useState } from 'react';
import { useUser } from '@/lib/useUser';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import logger from '@/lib/utils/logger';

/**
 * Profile Settings Page
 * 
 * Allows users to view and update their profile information.
 */
export default function ProfileSettingsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Initialize form with user data when it's loaded
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      // TODO: Implement updateProfile server action
      // const result = await updateProfile({ name, email });
      
      // if (result.success) {
      //   setSuccessMessage('Profile updated successfully');
      // } else {
      //   setErrorMessage(result.error);
      // }
      
      // Temporary mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(`Failed to update profile: ${error}`);
      logger.error('Error updating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }
  
  // Error state if user is not found
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
          <p>Error loading user profile. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Profile Settings</h2>
      </div>
      
      <div className="p-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md">
            {successMessage}
          </div>
        )}
        
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your full name"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your email address"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
