'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/services/api';
import { Product } from '@/types';
import {
  Search,
  ShoppingCart,
  Star,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { isLikelyImageUrl, normalizeImageSrc } from '@/lib/image';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
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
        const data = await productService.getAll({
          search,
          category: filters.category,
          brandName: filters.brandName,
          colour: filters.colour,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        });

        setProducts(data || []);

        // Extract unique brands and colours
        const uniqueBrands = Array.from(new Set((data || []).map((p: Product) => p.brandName))) as string[];
        const uniqueColours = Array.from(new Set((data || []).map((p: Product) => p.colour || ''))) as string[];

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

  const addToCart = (product: Product) => {
    if (!user) {
      toast.error('Please log in to add items to your cart.');
      return;
    }
    toast.success(`${product.name} added to cart`);
  };

  if (authLoading) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

      {/* Hero Section */}
      <section className="relative py-20 flex items-center justify-center text-center px-4 overflow-hidden rounded-[2.5rem] bg-black text-white">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-gray-800 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-8 right-20 w-96 h-96 bg-gray-900 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 space-y-8 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Rent Anything, <br />
            <span className="text-gray-400">Anywhere.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            The world's most versatile rental marketplace. From your dream car to essential home tools, find it all here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/properties" className="bg-white text-black px-8 py-3.5 rounded-2xl font-bold hover:bg-gray-100 transition shadow-xl transform hover:-translate-y-0.5">
              Start Browsing
            </Link>
            {!isAuthenticated && (
              <Link href="/register" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-2xl font-bold hover:bg-white/20 transition shadow-xl transform hover:-translate-y-0.5">
                Become a Provider
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Filters Panel - Updated with neutral style */}
      <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Refine Results</h3>
            <button onClick={() => setShowFilters(false)} className="text-sm text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
              Close Filters <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 ml-1">Category</label>
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-black focus:border-black py-2.5 text-sm transition-all">
                <option value="">All Categories</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 ml-1">Brand</label>
              <select value={filters.brandName} onChange={(e) => setFilters({ ...filters, brandName: e.target.value })} className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-black focus:border-black py-2.5 text-sm transition-all">
                <option value="">All Brands</option>
                {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 ml-1">Color</label>
              <select value={filters.colour} onChange={(e) => setFilters({ ...filters, colour: e.target.value })} className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-black focus:border-black py-2.5 text-sm transition-all">
                <option value="">All Colors</option>
                {colours.map((colour) => <option key={colour} value={colour}>{colour}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 ml-1">Price Range</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-black focus:border-black py-2.5 text-sm" />
                <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-black focus:border-black py-2.5 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 ml-1">Rental Period</label>
              <select value={filters.duration} onChange={(e) => setFilters({ ...filters, duration: e.target.value as 'HOUR' | 'DAY' | 'MONTH' })} className="w-full rounded-xl border-black bg-black text-white focus:ring-2 focus:ring-black py-2.5 text-sm font-medium transition-all">
                <option value="HOUR">Per Hour</option>
                <option value="DAY">Per Day</option>
                <option value="MONTH">Per Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Products</h2>
            <p className="text-sm text-gray-500 mt-1">Handpicked rentals for your next project or adventure.</p>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
          >
            <Search size={16} />
            Filters
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-pulse h-[380px]"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6 text-gray-300">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">Try adjusting your search or clearing filters.</p>
            <button onClick={() => setFilters({ category: '', brandName: '', colour: '', minPrice: '', maxPrice: '', duration: 'DAY' })} className="bg-black text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: Product) => {
              const price = filters.duration === 'HOUR'
                ? product.pricePerHour
                : filters.duration === 'MONTH'
                ? product.pricePerMonth
                : product.pricePerDay;

              return (
                <div key={product._id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
                  <Link href={`/properties/${product._id}`} className="block relative aspect-[4/3] bg-gray-50 overflow-hidden">
                    {product.photos && product.photos.length > 0 ? (
                      (() => {
                        const raw = product.photos[0];
                        const candidate = /^https?:\/\//i.test(raw) ? raw : `http://localhost:5000${raw}`;
                        const safe = isLikelyImageUrl(candidate) ? (normalizeImageSrc(candidate) ?? candidate) : '/file.svg';
                        return (
                          <Image
                            src={safe}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        );
                      })()
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package size={32} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-bold text-gray-900">4.9</span>
                      </div>
                    </div>
                  </Link>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{product.category}</span>
                      <Link href={`/properties/${product._id}`}>
                        <h3 className="text-base font-bold text-gray-900 mt-1 line-clamp-1 hover:text-black transition-colors">{product.name}</h3>
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">{product.brandName}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Price per {filters.duration.toLowerCase()}</p>
                        <p className="text-lg font-bold text-gray-900">₹{price}</p>
                      </div>
                      <button onClick={() => addToCart(product)} className="p-2.5 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors shadow-sm">
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
