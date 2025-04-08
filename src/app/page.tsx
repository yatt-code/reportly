import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Reportly</h1>
      <p className="mb-4">Your AI-Powered Reporting Platform.</p>
      <div className="flex gap-4">
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Login
        </Link>
        <Link href="/register" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Register
        </Link>
         <Link href="/dashboard" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Dashboard (Temp)
        </Link>
      </div>
    </main>
  );
}