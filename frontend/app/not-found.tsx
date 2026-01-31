import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center">
      <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Oops! The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
      >
        <Home className="w-5 h-5" />
        Back to Home
      </Link>
    </div>
  );
}
