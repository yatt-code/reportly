import Link from 'next/link';
import DemoModeButton from '@/components/demo/DemoModeButton';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Reportly</h1>
      <p className="mb-8 text-center max-w-md">Your AI-Powered Reporting Platform. Create, manage, and collaborate on reports with AI assistance.</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center">
          Login
        </Link>
        <Link href="/register" className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center">
          Register
        </Link>
      </div>

      <div className="mt-4">
        <DemoModeButton size="lg" />
      </div>

      <p className="mt-8 text-sm text-gray-500 max-w-md text-center">
        Try the demo mode to explore Reportly without creating an account. All changes will be stored locally in your browser.
      </p>
    </main>
  );
}