'use client';

import Link from 'next/link';
import { Building, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'owner':
          router.push('/owner/dashboard');
          break;
        case 'tenant':
          router.push('/tenant/dashboard');
          break;
      }
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          Welcome to <span className="text-blue-600">Rental MS</span>
        </h1>
        {isAuthenticated && user ? (
          <div className="space-y-4">
            <p className="text-2xl font-semibold text-gray-800">
              Hello, {user.name}!
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/properties"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                View Properties
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition shadow-lg"
                >
                  Admin Dashboard
                </Link>
              )}
              {user.role === 'owner' && (
                <Link
                  href="/properties/add"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
                >
                  Add Property
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse thousands of curated properties, from cozy apartments to luxury villas.
              Manage your rentals with ease and security.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Register
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="text-center space-y-4">
          <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-blue-600">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Curated Listings</h3>
          <p className="text-gray-600">
            We handpick properties to ensure they meet our quality and safety standards.
          </p>
        </div>
        <div className="text-center space-y-4">
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-green-600">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Secure Booking</h3>
          <p className="text-gray-600">
            Your payments and personal data are protected by state-of-the-art security.
          </p>
        </div>
        <div className="text-center space-y-4">
          <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-purple-600">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Instant Support</h3>
          <p className="text-gray-600">
            Our dedicated team is here to help you 24/7 with any questions or issues.
          </p>
        </div>
      </section>
    </div>
  );
}
