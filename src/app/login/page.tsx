import React from 'react';
import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm'; // Import the client component form

export const metadata: Metadata = {
  title: 'Login - Reportly',
  description: 'Log in to your Reportly account.',
};

/**
 * Login page component. Renders the LoginForm.
 * This page itself can be a Server Component.
 */
const LoginPage = () => {
    return (
        // The LoginForm component handles layout and centering
        <LoginForm />
    );
};

export default LoginPage;