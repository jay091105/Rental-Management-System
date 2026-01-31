'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Package, BarChart3, Calendar, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">RentalHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {user.role === 'VENDOR' ? (
                  <>
                    <Link href="/vendor/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Dashboard
                    </Link>
                    <Link href="/vendor/products" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Products
                    </Link>
                    <Link href="/orders" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Orders
                    </Link>
                    <Link href="/vendor/reports" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Reports
                    </Link>
                    <Link href="/vendor/schedule" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Schedule
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Products
                    </Link>
                    <Link href="/cart" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Cart
                    </Link>
                    <Link href="/orders" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      Orders
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <User size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Login
                </Link>
                <Link href="/register" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-2">
            {user ? (
              <>
                {user.role === 'VENDOR' ? (
                  <>
                    <Link href="/vendor/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                      Dashboard
                    </Link>
                    <Link href="/vendor/products" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                      Products
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                      Orders
                    </Link>
                    <Link href="/vendor/reports" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                      Reports
                    </Link>
                    <Link href="/vendor/schedule" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                      Schedule
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                      Products
                    </Link>
                    <Link href="/cart" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                      Cart
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                      Orders
                    </Link>
                  </>
                )}
                <div className="px-4 py-2 text-gray-700 font-medium">{user.name}</div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Login
                </Link>
                <Link href="/register" className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-semibold">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
