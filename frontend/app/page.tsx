'use client';

import Link from 'next/link';
import { Package, ShieldCheck, Clock, Car, Home as HomeIcon, Hammer, Laptop, PartyPopper, Sofa, Shirt, Trophy } from 'lucide-react';
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
        case 'provider':
          router.push('/provider/dashboard');
          break;
        case 'renter':
          router.push('/renter/dashboard');
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
      <section className="relative h-[500px] flex items-center justify-center text-center px-4 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 space-y-8 max-w-4xl">
          <h1 className="text-6xl font-black tracking-tight leading-tight">
            Rent Anything, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Anywhere.</span>
          </h1>
          <p className="text-xl text-blue-50/90 max-w-2xl mx-auto font-medium">
            The world's most versatile rental marketplace. From your dream car to essential home tools, find it all here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold hover:bg-blue-50 transition shadow-xl transform hover:-translate-y-1"
            >
              Start Browsing
            </Link>
            {!isAuthenticated && (
              <Link
                href="/register"
                className="bg-blue-500/20 backdrop-blur-md text-white border-2 border-white/30 px-10 py-4 rounded-2xl font-bold hover:bg-white/10 transition shadow-xl transform hover:-translate-y-1"
              >
                Become a Provider
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-500">Explore our vast range of rentable items.</p>
          </div>
          <Link href="/products" className="text-blue-600 font-bold hover:underline">View All</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { name: 'Real Estate', icon: HomeIcon, color: 'bg-orange-50 text-orange-600' },
            { name: 'Vehicles', icon: Car, color: 'bg-blue-50 text-blue-600' },
            { name: 'Tools', icon: Hammer, color: 'bg-green-50 text-green-600' },
            { name: 'Electronics', icon: Laptop, color: 'bg-purple-50 text-purple-600' },
            { name: 'Events', icon: PartyPopper, color: 'bg-pink-50 text-pink-600' },
            { name: 'Furniture', icon: Sofa, color: 'bg-yellow-50 text-yellow-600' },
            { name: 'Fashion', icon: Shirt, color: 'bg-indigo-50 text-indigo-600' },
            { name: 'Sports', icon: Trophy, color: 'bg-red-50 text-red-600' },
          ].map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${cat.name}`}
              className="group flex flex-col items-center p-6 bg-white rounded-3xl border border-gray-100 hover:border-blue-500 hover:shadow-xl transition duration-300"
            >
              <div className={`${cat.color} p-4 rounded-2xl group-hover:scale-110 transition duration-300`}>
                <cat.icon className="w-8 h-8" />
              </div>
              <span className="mt-4 font-bold text-gray-700 text-sm whitespace-nowrap">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="text-center space-y-4">
          <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-blue-600">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Curated Listings</h3>
          <p className="text-gray-600">
            We handpick products to ensure they meet our quality and safety standards.
          </p>
        </div>
        <div className="text-center space-y-4">
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-green-600">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Secure Rental</h3>
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
