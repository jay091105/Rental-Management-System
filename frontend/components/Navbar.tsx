'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Package, LogOut, User as UserIcon, Menu, X, ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  // Poll provider orders count when provider is signed in
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const fetchCount = async () => {
      if (user?.role === 'provider') {
        try {
          const data = await (await import('@/services/api')).orderService.getProviderOrders();
          const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
          const count = Array.isArray(list) ? list.filter((o: any) => o.status === 'pending').length : 0;
          setPendingCount(count);
        } catch (err) {
          // ignore polling errors
          console.error('Failed to fetch provider orders count', err);
        }
      } else {
        setPendingCount(0);
      }
    };
    fetchCount();
    timer = setInterval(fetchCount, 30000);
    return () => { if (timer) clearInterval(timer); };
  }, [user]);

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Rentify</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/properties" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Products
            </Link>

            <Link href="/orders" className="relative text-gray-600 hover:text-blue-600 font-medium transition">
              Orders
              {pendingCount > 0 && user?.role === 'provider' && (
                <span className="absolute -top-2 -right-3 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">{pendingCount}</span>
              )}
            </Link>

            <Link href="/invoices" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Invoices
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link href="/admin/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition">
                    Dashboard
                  </Link>
                )}
                {user?.role === 'provider' && (
                  <Link href="/provider/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition">
                    Dashboard
                  </Link>
                )}
                {user?.role === 'renter' && (
                  <Link href="/renter/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition">
                    Dashboard
                  </Link>
                )}
                
                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                <div className="flex items-center gap-4">
                  <Link href="/profile" className="flex items-center gap-3 pl-2 group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:border-blue-300 transition-colors">
                      <UserIcon size={18} className="text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium uppercase tracking-wider">{user?.role}</p>
                    </div>
                  </Link>
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
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                  Sign In
                </Link>
                <Link href="/register" className="bg-blue-600 text-white py-2.5 px-6 rounded-lg text-sm font-bold shadow-blue-500/20 shadow-lg hover:bg-blue-700 transition-all">
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
          <div className="md:hidden py-4 border-t border-gray-100 space-y-2 bg-white">
            <Link href="/properties" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
              Products
            </Link>
            <Link href="/orders" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
              Orders
            </Link>
            <Link href="/invoices" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
              Invoices
            </Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link href="/admin/dashboard" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                )}
                {user?.role === 'provider' && (
                  <Link href="/provider/dashboard" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                )}
                {user?.role === 'renter' && (
                  <Link href="/renter/dashboard" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                )}
                <Link href="/profile" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <div className="border-t border-gray-100 my-2 pt-2">
                  <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                      {user?.name?.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900">{user?.name}</span>
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
                <Link href="/login" className="block w-full text-center py-3 text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                  Log In
                </Link>
                <Link href="/register" className="block w-full text-center py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
