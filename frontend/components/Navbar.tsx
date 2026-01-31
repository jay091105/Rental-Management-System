'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Package, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
            <Package className="w-6 h-6" />
            <span>Rentals</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/products" className="text-gray-600 hover:text-blue-600 transition">
              Products
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/rentals" className="text-gray-600 hover:text-blue-600 transition">
                  My Rentals
                </Link>
                {user?.role === 'admin' && (
                  <Link href="/admin/dashboard" className="text-gray-600 hover:text-blue-600 transition">
                    Dashboard
                  </Link>
                )}
                {user?.role === 'provider' && (
                  <Link href="/provider/dashboard" className="text-gray-600 hover:text-blue-600 transition">
                    Dashboard
                  </Link>
                )}
                {user?.role === 'renter' && (
                  <Link href="/renter/dashboard" className="text-gray-600 hover:text-blue-600 transition">
                    Dashboard
                  </Link>
                )}
                <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition">
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-red-500 hover:text-red-700 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-blue-600 transition font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
