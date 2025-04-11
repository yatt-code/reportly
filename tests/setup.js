// This file runs before each test suite after the environment is set up.
// Use it for global mocks or setup tasks.

// Mock the server-side auth helper globally
jest.mock('@/lib/auth.server', () => ({
  // Default mock implementation (returns null, meaning unauthenticated)
  getCurrentUser: jest.fn().mockResolvedValue(null),
}));

// Mock the client-side auth helper globally (if needed by components)
jest.mock('@/lib/auth', () => ({
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
}));

// Mock logger globally
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock next/navigation globally (for hooks like useRouter, usePathname)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    // Add other methods if needed by tests
  }),
  usePathname: jest.fn(() => '/mock-path'), // Default mock path
  redirect: jest.fn((url) => { throw new Error(`REDIRECT_CALLED_WITH: ${url}`) }), // Mock redirect to check calls
  notFound: jest.fn(() => { throw new Error('NOT_FOUND_CALLED') }), // Mock notFound
}));

// Mock next/cache globally
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
    custom: jest.fn(),
}));

// Add any other global mocks here
