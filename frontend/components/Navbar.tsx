'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Package, LogOut, User as UserIcon, Menu, X, ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [renterOrderCount, setRenterOrderCount] = useState<number>(0);
  const [renterConfirmedCount, setRenterConfirmedCount] = useState<number>(0);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  // Poll orders count for provider and renter (provider: pending; renter: total/confirmed)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const fetchCount = async () => {
      try {
        if (user?.role === 'provider') {
          const data = await (await import('@/services/api')).orderService.getProviderOrders();
          const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
          const count = Array.isArray(list) ? list.filter((o: any) => o.status === 'pending').length : 0;
          setPendingCount(count);
        } else {
          setPendingCount(0);
        }

        if (user?.role === 'renter') {
          const data = await (await import('@/services/api')).orderService.getMyOrders();
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.orders)
            ? data.orders
            : Array.isArray(data?.items)
            ? data.items
            : [];
          const total = Array.isArray(list) ? list.length : 0;
          const confirmed = Array.isArray(list) ? list.filter((o: any) => o.status === 'confirmed' || o.status === 'paid').length : 0;
          setRenterOrderCount(total);
          setRenterConfirmedCount(confirmed);
        } else {
          setRenterOrderCount(0);
          setRenterConfirmedCount(0);
        }
      } catch (err) {
        console.error('Failed to fetch orders count', err);
      }
    };
    fetchCount();
    timer = setInterval(fetchCount, 30000);
    return () => { if (timer) clearInterval(timer); };
  }, [user]);

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Rentify</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/properties" className="text-sm font-medium text-gray-600 hover:text-black transition">
              Products
            </Link>

            <Link href="/orders" className="relative text-sm font-medium text-gray-600 hover:text-black transition">
              Orders
              {pendingCount > 0 && user?.role === 'provider' && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white ring-2 ring-white">
                  {pendingCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link href="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-black transition">
                    Dashboard
                  </Link>
                )}
                {user?.role === 'provider' && (
                  <Link href="/provider/dashboard" className="text-sm font-medium text-gray-600 hover:text-black transition">
                    Dashboard
                  </Link>
                )}
                {user?.role === 'renter' && (
                  <Link href="/renter/dashboard" className="text-sm font-medium text-gray-600 hover:text-black transition">
                    Dashboard
                  </Link>
                )}
                
                <div className="h-4 w-px bg-gray-200 mx-2"></div>

                <div className="flex items-center gap-4">
                  <Link href="/profile" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                      <UserIcon size={16} className="text-gray-600" />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-gray-900 leading-none">{user?.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{user?.role}</p>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-black rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black px-3 py-2 rounded-xl hover:bg-gray-50 transition-all">
                  Sign In
                </Link>
                <Link href="/register" className="bg-black text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-800 transition-all">
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
          <div className="md:hidden py-4 border-t border-gray-100 space-y-1 bg-white">
            <Link href="/properties" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              Products
            </Link>
            <Link href="/orders" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              Orders
            </Link>
            {isAuthenticated ? (
              <>
                <Link href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'provider' ? '/provider/dashboard' : '/renter/dashboard'} className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/profile" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="px-4 pt-2 space-y-2">
                <Link href="/login" className="block w-full text-center py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="block w-full text-center py-2 text-sm font-medium bg-black text-white rounded-xl hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>
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
