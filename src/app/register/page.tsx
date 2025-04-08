import React from 'react';
import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm'; // Import the client component form

export const metadata: Metadata = {
  title: 'Register - Reportly',
  description: 'Create a new Reportly account.',
};

/**
 * Register page component. Renders the RegisterForm.
 * This page itself can be a Server Component.
 */
const RegisterPage = () => {
    return (
        // The RegisterForm component handles layout and centering
        <RegisterForm />
    );
};

export default RegisterPage;