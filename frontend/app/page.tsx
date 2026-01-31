'use client';

import { useState, useEffect } from 'react';
import { propertyService } from '@/services/api';
import { Property } from '@/types';
import {
  Search,
  ShoppingCart,
  Star,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    category: string;
    brandName: string;
    colour: string;
    minPrice: string;
    maxPrice: string;
    duration: 'HOUR' | 'DAY' | 'MONTH';
  }>({
    category: '',
    brandName: '',
    colour: '',
    minPrice: '',
    maxPrice: '',
    duration: 'DAY',
  });

  const [categories, setCategories] = useState<string[]>([
    'Real Estate',
    'Vehicles',
    'Tools',
    'Electronics',
    'Events',
    'Furniture',
    'Fashion',
    'Sports',
  ]);
  const [brands, setBrands] = useState<string[]>([]);
  const [colours, setColours] = useState<string[]>([]);
  // Redirect based on user role
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
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
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const data = await propertyService.getAll({
          search,
          category: filters.category,
          brandName: filters.brandName,
          colour: filters.colour,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        });

        setProperties(data || []);

        // Extract unique brands and colours
        const uniqueBrands = Array.from(new Set((data || []).map((p: Property) => p.brandName))) as string[];
        const uniqueColours = Array.from(new Set((data || []).map((p: Property) => p.colour || ''))) as string[];

        setBrands(uniqueBrands);
        setColours(uniqueColours);
      } catch (err: unknown) {
        console.error(err);
        toast.error('Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [search, filters]);

  const addToCart = (property: Property) => {
    if (!user) {
      toast.error('Please log in to add items to your cart.');
      return;
    }
    toast.success(`${property.name} added to cart`);
  };

  if (authLoading) return null;

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
            <Link href="/properties" className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold hover:bg-blue-50 transition shadow-xl transform hover:-translate-y-1">
              Start Browsing
            </Link>
            {!isAuthenticated && (
              <Link href="/register" className="bg-blue-500/20 backdrop-blur-md text-white border-2 border-white/30 px-10 py-4 rounded-2xl font-bold hover:bg-white/10 transition shadow-xl transform hover:-translate-y-1">
                Become a Provider
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Filters Panel */}
      <div className={`border-y border-gray-200 bg-white/80 backdrop-blur-md sticky top-16 z-40 transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="container-custom py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Refine Results</h3>
            <button onClick={() => setShowFilters(false)} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1">
              Close Filters <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="form-input py-2.5 text-sm">
              <option value="">All Categories</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select value={filters.brandName} onChange={(e) => setFilters({ ...filters, brandName: e.target.value })} className="form-input py-2.5 text-sm">
              <option value="">All Brands</option>
              {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
            </select>

            <select value={filters.colour} onChange={(e) => setFilters({ ...filters, colour: e.target.value })} className="form-input py-2.5 text-sm">
              <option value="">All Colors</option>
              {colours.map((colour) => <option key={colour} value={colour}>{colour}</option>)}
            </select>

            <input type="number" placeholder="Min Price" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} className="form-input py-2.5 text-sm" />
            <input type="number" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} className="form-input py-2.5 text-sm" />

            <select value={filters.duration} onChange={(e) => setFilters({ ...filters, duration: e.target.value as 'HOUR' | 'DAY' | 'MONTH' })} className="form-input py-2.5 text-sm bg-brand-50 border-brand-100 text-brand-700 font-medium">
              <option value="HOUR">Per Hour</option>
              <option value="DAY">Per Day</option>
              <option value="MONTH">Per Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="py-20 bg-surface-50 container-custom">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse h-[400px]"></div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-6 text-gray-300">
              <Search size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">Try adjusting your search or clearing filters.</p>
            <button onClick={() => setFilters({ category: '', brandName: '', colour: '', minPrice: '', maxPrice: '', duration: 'DAY' })} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.map((property: Property) => {
              const price = filters.duration === 'HOUR'
                ? property.pricePerHour
                : filters.duration === 'MONTH'
                ? property.pricePerMonth
                : property.pricePerDay;

              return (
                <div key={property._id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {property.photos && property.photos.length > 0 ? (
                      <Image
                        src={`http://localhost:5000${property.photos[0]}`}
                        alt={property.name}
                        fill
                        sizes="100%"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        <span className="text-sm font-medium">No Image Available</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur rounded-lg shadow-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-gray-900">4.9</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 mb-2">{property.category}</span>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors">{property.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{property.brandName}</p>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Price per {filters.duration.toLowerCase()}</p>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-bold text-gray-900">₹</span>
                          <span className="text-2xl font-extrabold text-gray-900">{price}</span>
                        </div>
                      </div>
                      <button onClick={() => addToCart(property)} className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors shadow-sm">
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
