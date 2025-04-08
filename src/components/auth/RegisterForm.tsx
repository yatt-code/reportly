'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/auth'; // Import the register helper
import { useAuth } from './AuthProvider'; // To potentially check if already logged in
import logger from '@/lib/utils/logger';
import toast from 'react-hot-toast';
import { Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';

/**
 * Registration form component. Handles user input, calls the register helper,
 * and manages loading/error states.
 */
const RegisterForm: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth(); // Get auth state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if user is already authenticated and not loading
    React.useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            logger.log('[RegisterForm] User already authenticated, redirecting to dashboard.');
            router.push('/dashboard');
        }
    }, [isAuthenticated, isAuthLoading, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            toast.error('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Creating account...');

        try {
            const result = await register({ email, password });

            if (result.error) {
                // Handle specific Supabase errors if needed (e.g., user already exists)
                const errorMessage = result.error.message || 'Registration failed. Please try again.';
                throw new Error(errorMessage);
            }

            // Success (even if email confirmation is needed)
            logger.log('[RegisterForm] Registration successful, redirecting...');
            toast.success('Account created successfully! Check your email for confirmation if required.', { id: toastId, duration: 5000 });
            // AuthProvider will detect the session change (or lack thereof if confirmation needed).
            // Redirect to dashboard or login page depending on confirmation requirement.
            // For simplicity, redirecting to dashboard assuming auto-login or quick confirmation.
            router.push('/dashboard');
            // No need to setIsLoading(false) on success due to navigation

        } catch (err) {
            const registerError = err instanceof Error ? err : new Error(String(err));
            logger.error('[RegisterForm] Registration attempt failed.', registerError);
            setError(registerError.message);
            toast.error(`Registration failed: ${registerError.message}`, { id: toastId });
            setIsLoading(false); // Keep form enabled on error
        }
    };

     // Don't render the form if auth state is still loading or user is already logged in
    if (isAuthLoading || isAuthenticated) {
        return (
             <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
             </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                    Create your Reportly Account
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            placeholder="•••••••• (min. 6 characters)"
                        />
                    </div>

                     <div>
                        <label
                            htmlFor="confirm-password"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus size={18} />}
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>
                </form>
                 <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:hover:text-blue-400">
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;