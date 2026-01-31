'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Product } from '@/types';
import { Search, ShoppingCart, Star, Shield, Truck, Clock, ArrowRight, Filter, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-surface-50">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-surface-50">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        </div>

        <div className="container-custom relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-brand-100 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span className="text-sm font-medium text-brand-700">The #1 Platform for Premium Rentals</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.1] animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Own the Experience,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">
                Not the Asset.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Access thousands of premium products from top brands. Rent heavily, live lightly.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-16 animate-slide-up relative z-20" style={{ animationDelay: '0.3s' }}>
              <div className="bg-white p-2 rounded-2xl shadow-premium flex items-center gap-2 border border-gray-100">
                <div className="flex-1 flex items-center gap-3 pl-4">
                  <Search className="text-gray-400" size={24} />
                  <input
                    type="text"
                    placeholder="Search for macbooks, cameras, drones..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full py-3 text-lg bg-transparent border-none focus:ring-0 placeholder-gray-400 text-gray-900"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-5 py-3 rounded-xl font-medium transition-all ${showFilters
                    ? 'bg-brand-50 text-brand-600'
                    : 'hover:bg-gray-50 text-gray-600'
                    }`}
                >
                  <Filter size={20} />
                </button>
                <button className="btn-primary py-3 px-8 rounded-xl shadow-lg shadow-brand-500/30">
                  Search
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {[
                { label: 'Active Listings', value: `${products.length}+` },
                { label: 'Happy Renters', value: '250+ ' }, // Placeholder
                { label: 'Cities Covered', value: '12+' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center group cursor-default">
                  <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filters Panel */}
      <div className={`border-y border-gray-200 bg-white/80 backdrop-blur-md sticky top-16 z-40 transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="container-custom py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Refine Results</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
            >
              Close Filters <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="form-input py-2.5 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select
              value={filters.brandName}
              onChange={(e) => setFilters({ ...filters, brandName: e.target.value })}
              className="form-input py-2.5 text-sm"
            >
              <option value="">All Brands</option>
              {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
            </select>

            <select
              value={filters.colour}
              onChange={(e) => setFilters({ ...filters, colour: e.target.value })}
              className="form-input py-2.5 text-sm"
            >
              <option value="">All Colors</option>
              {colours.map(colour => <option key={colour} value={colour}>{colour}</option>)}
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="form-input py-2.5 text-sm"
            />

            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="form-input py-2.5 text-sm"
            />

            <select
              value={filters.duration}
              onChange={(e) => setFilters({ ...filters, duration: e.target.value as any })}
              className="form-input py-2.5 text-sm bg-brand-50 border-brand-100 text-brand-700 font-medium"
            >
              <option value="HOUR">Per Hour</option>
              <option value="DAY">Per Day</option>
              <option value="MONTH">Per Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="py-20 bg-surface-50">
        <div className="container-custom">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Collection</h2>
              <p className="text-gray-600 text-lg">Curated items available for immediate rental</p>
            </div>

            <Link href="/cart" className="group flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:border-brand-500 hover:shadow-lg transition-all duration-300">
              <span className="relative">
                <ShoppingCart size={22} className="text-gray-700 group-hover:text-brand-600 transition-colors" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {cart.length}
                  </span>
                )}
              </span>
              <span className="font-semibold text-gray-700 group-hover:text-brand-600">View Cart</span>
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse h-[400px]">
                  <div className="w-full h-56 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-6 text-gray-300">
                <Search size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-8">
                We couldn't find any items matching your filters. Try adjusting your search or clearing some filters.
              </p>
              <button
                onClick={() => { setSearch(''); setFilters({ category: '', brandName: '', colour: '', minPrice: '', maxPrice: '', duration: 'DAY' }); }}
                className="btn-primary"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => {
              const price = filters.duration === 'HOUR' ? product.pricePerHour :
                filters.duration === 'MONTH' ? product.pricePerMonth : product.pricePerDay;

              return (
                <div key={product._id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-premium hover:border-brand-200 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {product.photos && product.photos.length > 0 ? (
                      <Image
                        src={`http://localhost:5000${product.photos[0]}`}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        <span className="text-sm font-medium">No Image Available</span>
                      </div>
                    )}

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur rounded-lg shadow-sm">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-gray-900">4.9</span>
                      </div>

                      {product.availableUnits > 0 ? (
                        <span className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur text-white text-xs font-bold rounded-lg shadow-sm">
                          In Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-red-500/90 backdrop-blur text-white text-xs font-bold rounded-lg shadow-sm">
                          Out
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600">
                        {product.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-500 mb-4">{product.brandName}</p>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Price per {filters.duration.toLowerCase()}</p>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-bold text-gray-900">₹</span>
                          <span className="text-2xl font-extrabold text-gray-900">{price}</span>
                        </div>
                      </div>

                      {product.availableUnits > 0 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                          }}
                          className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors shadow-sm"
                          title="Add to Cart"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      )}
                    </div>

                    <Link href={`/products/${product._id}`} className="absolute inset-0 z-0">
                      <span className="sr-only">View {product.name}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features/Trust Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Rent With Us?</h2>
            <p className="text-gray-500">We make renting simple, transparent, and secure for everyone.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Shield,
                title: 'Verified Quality',
                desc: 'Every product is inspected for quality and performance before listing.',
                color: 'text-brand-600',
                bg: 'bg-brand-50'
              },
              {
                icon: Truck,
                title: 'Instant Delivery',
                desc: 'Get your rentals delivered to your doorstep within 24 hours.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50'
              },
              {
                icon: Clock,
                title: 'Flexible Plans',
                desc: 'Rent for a day, a week, or a month. Extend anytime with one click.',
                color: 'text-purple-600',
                bg: 'bg-purple-50'
              },
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-surface-50 transition-colors duration-300">
                <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 rotate-3 group-hover:rotate-6 transition-transform`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-900/20"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

        <div className="container-custom relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Upgrade Your Life?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of smart renters who save money and live better.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary min-w-[200px]">
                Get Started
              </Link>
              <Link href="/login" className="px-8 py-3.5 rounded-xl font-semibold text-white border border-gray-700 hover:bg-gray-800 hover:border-gray-600 transition-all min-w-[200px]">
                Log In
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
