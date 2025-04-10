import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrganizationSettingsPage from '@/app/settings/organization/page';
import { getOrganization } from '@/app/actions/organization/getOrganization';
import { updateOrganization } from '@/app/actions/organization/updateOrganization';
import { createOrganization } from '@/app/actions/organization/createOrganization';

// Mock dependencies
jest.mock('@/lib/useUser', () => ({
  useUser: jest.fn(),
}));

jest.mock('@/app/actions/organization/getOrganization', () => ({
  getOrganization: jest.fn(),
}));

jest.mock('@/app/actions/organization/updateOrganization', () => ({
  updateOrganization: jest.fn(),
}));

jest.mock('@/app/actions/organization/createOrganization', () => ({
  createOrganization: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('Organization Management Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle the complete organization creation flow', async () => {
    // Mock useUser
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: { id: 'user-123', name: 'Test User' },
      isLoading: false,
    });

    // Mock getOrganization to initially return no organization
    (getOrganization as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'User has no organization',
    });

    // Mock createOrganization to return success
    (createOrganization as jest.Mock).mockResolvedValue({
      success: true,
      organizationId: 'new-org-123',
    });

    // Mock getOrganization to return the new organization after creation
    (getOrganization as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'User has no organization',
    }).mockResolvedValueOnce({
      success: true,
      data: {
        id: 'new-org-123',
        name: 'Acme Corporation',
        ownerId: 'user-123',
        memberCount: 1,
        createdAt: new Date().toISOString(),
      },
    });

    // Render the component
    render(<OrganizationSettingsPage />);

    // Wait for the initial load
    await waitFor(() => {
      expect(screen.getByLabelText('Organization Name')).toBeInTheDocument();
    });

    // Enter organization name
    fireEvent.change(screen.getByLabelText('Organization Name'), {
      target: { value: 'Acme Corporation' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));

    // Check that createOrganization was called with the correct name
    await waitFor(() => {
      expect(createOrganization).toHaveBeenCalledWith('Acme Corporation');
    });

    // Check that success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Organization created successfully')).toBeInTheDocument();
    });

    // Check that getOrganization was called again to refresh the data
    expect(getOrganization).toHaveBeenCalledTimes(2);
  });

  it('should handle the complete organization update flow', async () => {
    // Mock useUser
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: { id: 'user-123', name: 'Test User' },
      isLoading: false,
    });

    // Mock getOrganization to return an existing organization
    (getOrganization as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 'org-123',
        name: 'Old Organization Name',
        ownerId: 'user-123',
        memberCount: 5,
        createdAt: new Date('2023-01-01').toISOString(),
      },
    });

    // Mock updateOrganization to return success
    (updateOrganization as jest.Mock).mockResolvedValue({
      success: true,
    });

    // Render the component
    render(<OrganizationSettingsPage />);

    // Wait for the organization data to be loaded
    await waitFor(() => {
      expect(screen.getByDisplayValue('Old Organization Name')).toBeInTheDocument();
    });

    // Check that organization info is displayed
    expect(screen.getByText('5 Members')).toBeInTheDocument();

    // Change the organization name
    fireEvent.change(screen.getByLabelText('Organization Name'), {
      target: { value: 'New Organization Name' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));

    // Check that updateOrganization was called with the correct name
    await waitFor(() => {
      expect(updateOrganization).toHaveBeenCalledWith('New Organization Name');
    });

    // Check that success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Organization updated successfully')).toBeInTheDocument();
    });
  });

  it('should handle error scenarios gracefully', async () => {
    // Mock useUser
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: { id: 'user-123', name: 'Test User' },
      isLoading: false,
    });

    // Mock getOrganization to return an existing organization
    (getOrganization as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 'org-123',
        name: 'Test Organization',
        ownerId: 'user-123',
        memberCount: 5,
        createdAt: new Date('2023-01-01').toISOString(),
      },
    });

    // Mock updateOrganization to return an error
    (updateOrganization as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Permission denied: Only the organization owner can update the organization.',
    });

    // Render the component
    render(<OrganizationSettingsPage />);

    // Wait for the organization data to be loaded
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Organization')).toBeInTheDocument();
    });

    // Change the organization name
    fireEvent.change(screen.getByLabelText('Organization Name'), {
      target: { value: 'Updated Organization Name' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));

    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Permission denied: Only the organization owner can update the organization.')).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    // Mock useUser
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: { id: 'user-123', name: 'Test User' },
      isLoading: false,
    });

    // Mock getOrganization to throw an error
    (getOrganization as jest.Mock).mockRejectedValue(new Error('Network error'));

    // Render the component
    render(<OrganizationSettingsPage />);

    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch organization/)).toBeInTheDocument();
    });
  });
});
