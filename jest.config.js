const nextJest = require('next/jest')

// Providing the path to your Next.js app to load next.config.js and .env files in your test environment
const createJestConfig = nextJest({
  dir: './',
})

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom', // Use jsdom environment for React components/hooks if needed
  preset: 'ts-jest',
  // Explicitly tell ts-jest to use tsconfig paths
  globals: {
    'ts-jest': {
      tsconfig: {
        // Allow js file imports
        allowJs: true,
        // Map paths from tsconfig
        paths: {
          '@/*': ['./src/*']
        }
      },
    }
  },
  moduleNameMapper: {
    // Handle module aliases (this should match your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Updated transformIgnorePatterns to explicitly allow known ESM packages
  // More explicit pattern to allow transforming specific ESM modules
  transformIgnorePatterns: [
    "/node_modules/(?!(" +
      "lowlight|unist-util-visit|unist-util-is|react-mentions|@supabase/ssr|mermaid" +
      // Add other known ESM packages here, separated by |
    "))/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)