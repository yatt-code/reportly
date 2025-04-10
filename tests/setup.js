// Mock TextEncoder and TextDecoder for MongoDB
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Import Jest DOM extensions
require('@testing-library/jest-dom');

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/mock-path',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock server actions
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn().mockReturnValue({ value: 'mock-cookie-value' }),
    getAll: jest.fn().mockReturnValue([]),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  headers: () => ({
    get: jest.fn(),
    has: jest.fn(),
    entries: jest.fn(),
    values: jest.fn(),
    keys: jest.fn(),
    forEach: jest.fn(),
  }),
}));
