import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('OrganizationSettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state', () => {
    // Mock useUser to return loading state
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: null,
      isLoading: true,
    });

    render(<OrganizationSettingsPage />);

    // Check that loading state is shown
    expect(screen.getByText('Loading organization...')).toBeInTheDocument();
  });

  it('should show error state when user is not found', () => {
    // Mock useUser to return no user
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(<OrganizationSettingsPage />);

    // Check that error state is shown
    expect(screen.getByText('Error loading user profile. Please try again later.')).toBeInTheDocument();
  });

  it('should fetch and display organization data', async () => {
    // Mock useUser
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: { id: 'user-123', name: 'Test User' },
      isLoading: false,
    });

    // Mock getOrganization to return success
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

    render(<OrganizationSettingsPage />);

    // Wait for the organization data to be loaded
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Organization')).toBeInTheDocument();
    });

    // Check that organization info is displayed
    expect(screen.getByText('5 Members')).toBeInTheDocument();
    expect(screen.getByText(/Created: /)).toBeInTheDocument();
  });

  it('should show error message when organization fetch fails', async () => {
    // Mock useUser
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: { id: 'user-123', name: 'Test User' },
      isLoading: false,
    });

    // Mock getOrganization to return error
    (getOrganization as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Failed to fetch organization',
    });

    render(<OrganizationSettingsPage />);

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch organization')).toBeInTheDocument();
    });
  });

  it('should update organization name', async () => {
    // Mock useUser
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: { id: 'user-123', name: 'Test User' },
      isLoading: false,
    });

    // Mock getOrganization to return success
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

    // Mock updateOrganization to return success
    (updateOrganization as jest.Mock).mockResolvedValue({
      success: true,
    });

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

    // Check that updateOrganization was called with the correct arguments
    await waitFor(() => {
      expect(updateOrganization).toHaveBeenCalledWith('Updated Organization Name');
    });

    // Check that success message is displayed
    expect(screen.getByText('Organization updated successfully')).toBeInTheDocument();
  });

  it('should create organization when user has no organization', async () => {
    // Mock useUser
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: { id: 'user-123', name: 'Test User' },
      isLoading: false,
    });

    // Mock getOrganization to return error (no organization)
    (getOrganization as jest.Mock).mockResolvedValue({
      success: false,
      error: 'User has no organization',
    });

    // Mock createOrganization to return success
    (createOrganization as jest.Mock).mockResolvedValue({
      success: true,
      organizationId: 'new-org-123',
    });

    // Mock getOrganization to return success after creation
    (getOrganization as jest.Mock)
      .mockResolvedValueOnce({
        success: false,
        error: 'User has no organization',
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          id: 'new-org-123',
          name: 'New Organization',
          ownerId: 'user-123',
          memberCount: 1,
          createdAt: new Date().toISOString(),
        },
      });

    render(<OrganizationSettingsPage />);

    // Enter organization name
    await waitFor(() => {
      expect(screen.getByLabelText('Organization Name')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Organization Name'), {
      target: { value: 'New Organization' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));

    // Check that createOrganization was called with the correct arguments
    await waitFor(() => {
      expect(createOrganization).toHaveBeenCalledWith('New Organization');
    });

    // Check that success message is displayed
    expect(screen.getByText('Organization created successfully')).toBeInTheDocument();
  });

  it('should show error message when update fails', async () => {
    // Mock useUser
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: { id: 'user-123', name: 'Test User' },
      isLoading: false,
    });

    // Mock getOrganization to return success
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

    // Mock updateOrganization to return error
    (updateOrganization as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Failed to update organization',
    });

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
      expect(screen.getByText('Failed to update organization')).toBeInTheDocument();
    });
  });

  it('should validate organization name is not empty', async () => {
    // Mock useUser
    const useUserMock = require('@/lib/useUser').useUser;
    useUserMock.mockReturnValue({
      user: { id: 'user-123', name: 'Test User' },
      isLoading: false,
    });

    // Mock getOrganization to return success
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

    render(<OrganizationSettingsPage />);

    // Wait for the organization data to be loaded
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Organization')).toBeInTheDocument();
    });

    // Change the organization name to empty
    fireEvent.change(screen.getByLabelText('Organization Name'), {
      target: { value: '' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));

    // Check that error message is displayed
    expect(screen.getByText('Organization name cannot be empty')).toBeInTheDocument();

    // Check that updateOrganization was not called
    expect(updateOrganization).not.toHaveBeenCalled();
  });
});
