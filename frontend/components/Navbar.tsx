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
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 supports-[backdrop-filter]:bg-white/60">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-gray-900 tracking-tight">RentalHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                {user.role === 'VENDOR' ? (
                  <div className="flex items-center gap-6">
                    <Link href="/vendor/dashboard" className="nav-link font-medium text-gray-600 hover:text-brand-600 transition-colors">Dashboard</Link>
                    <Link href="/vendor/products" className="nav-link font-medium text-gray-600 hover:text-brand-600 transition-colors">Products</Link>
                    <Link href="/orders" className="nav-link font-medium text-gray-600 hover:text-brand-600 transition-colors">Orders</Link>
                    <Link href="/vendor/reports" className="nav-link font-medium text-gray-600 hover:text-brand-600 transition-colors">Reports</Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    <Link href="/" className="nav-link font-medium text-gray-600 hover:text-brand-600 transition-colors">Browse</Link>
                    <Link href="/orders" className="nav-link font-medium text-gray-600 hover:text-brand-600 transition-colors">My Orders</Link>
                    <Link href="/cart" className="nav-link font-medium text-gray-600 hover:text-brand-600 transition-colors">Cart</Link>
                  </div>
                )}

                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 pl-2">
                    <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center border border-gray-200">
                      <User size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">{user.role === 'VENDOR' ? 'Vendor' : 'Customer'}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-gray-600 hover:text-brand-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary py-2.5 px-6 rounded-lg text-sm shadow-brand-500/20 shadow-lg">
                  Get Started
                </Link>
              </div>
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
          <div className="md:hidden py-4 border-t border-gray-100 space-y-2 animate-fade-in bg-white">
            {user ? (
              <>
                {user.role === 'VENDOR' ? (
                  <>
                    <Link href="/vendor/dashboard" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Dashboard</Link>
                    <Link href="/vendor/products" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Products</Link>
                    <Link href="/orders" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Orders</Link>
                  </>
                ) : (
                  <>
                    <Link href="/" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Browse Products</Link>
                    <Link href="/cart" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">Cart</Link>
                    <Link href="/orders" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">My Orders</Link>
                  </>
                )}
                <div className="border-t border-gray-100 my-2 pt-2">
                  <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 space-y-3">
                <Link href="/login" className="block w-full text-center py-3 text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50">
                  Log In
                </Link>
                <Link href="/register" className="block w-full text-center py-3 bg-brand-600 text-white rounded-xl font-semibold shadow-lg shadow-brand-500/30">
                  Get Started
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
