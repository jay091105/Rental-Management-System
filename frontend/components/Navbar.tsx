'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Home, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
            <Home className="w-6 h-6" />
            <span>Rentals</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/properties" className="text-gray-600 hover:text-blue-600 transition">
              Properties
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/bookings" className="text-gray-600 hover:text-blue-600 transition">
                  My Bookings
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition">
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <UserIcon className="w-5 h-5" />
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 text-red-500 hover:text-red-700 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
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
