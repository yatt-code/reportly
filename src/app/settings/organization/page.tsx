'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/useUser';
import { Building, Users, Save, Loader2 } from 'lucide-react';
import { getOrganization } from '@/app/actions/organization/getOrganization';
import { updateOrganization } from '@/app/actions/organization/updateOrganization';
import { createOrganization } from '@/app/actions/organization/createOrganization';
import logger from '@/lib/utils/logger';

/**
 * Organization Settings Page
 *
 * Allows users to view and update their organization information.
 */
export default function OrganizationSettingsPage() {
  const { user, isLoading: isUserLoading } = useUser();

  const [organizationName, setOrganizationName] = useState('');
  const [organizationData, setOrganizationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch organization data
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!user) return;

      setIsLoading(true);

      try {
        // Call the getOrganization server action
        const result = await getOrganization();

        if (result.success) {
          setOrganizationData(result.data);
          setOrganizationName(result.data.name);
        } else {
          setErrorMessage(result.error);
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        setErrorMessage(`Failed to fetch organization: ${error}`);
        logger.error('Error fetching organization:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, [user]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organizationName.trim()) {
      setErrorMessage('Organization name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // If the user doesn't have an organization, create one
      if (!organizationData) {
        const createResult = await createOrganization(organizationName);

        if (createResult.success) {
          setSuccessMessage('Organization created successfully');
          // Refresh the organization data
          const getResult = await getOrganization();
          if (getResult.success) {
            setOrganizationData(getResult.data);
            setOrganizationName(getResult.data.name);
          }
        } else {
          setErrorMessage(createResult.error);
        }
      } else {
        // Update the existing organization
        const result = await updateOrganization(organizationName);

        if (result.success) {
          setSuccessMessage('Organization updated successfully');
          setOrganizationData({
            ...organizationData,
            name: organizationName,
          });
        } else {
          setErrorMessage(result.error);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(`Failed to update organization: ${error}`);
      logger.error('Error updating organization:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isUserLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading organization...</p>
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
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Organization Settings</h2>
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
          {/* Organization Name Field */}
          <div>
            <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Organization Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="org-name"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your organization name"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Organization Info */}
          {organizationData && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Organization Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {organizationData.memberCount} Members
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Created: {new Date(organizationData.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

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
