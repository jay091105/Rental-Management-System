'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/services/api';
import { Product } from '@/types';
import Link from 'next/link';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MapPin, Search, Package, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PropertiesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { user } = useAuth();

  const categories = [
    'All',
    'Real Estate',
    'Vehicles',
    'Equipment & Tools',
    'Electronics',
    'Events & Party',
    'Furniture',
    'Fashion',
    'Sports & Outdoors',
    'Other'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        const data = await productService.getAll(params);
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) return <Loading />;

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Explore Catalog</h1>
            <p className="text-sm text-gray-500 mt-1">Find high-quality products available for rent near you.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
              />
            </div>
            {(user?.role === 'admin' || user?.role === 'provider') && (
              <Link
                href="/properties/add"
                className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Link>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => {
              const candidate = (typeof product.pricePerDay === 'number' && product.pricePerDay > 0)
                ? product.pricePerDay
                : (typeof product.price === 'number' && product.price > 0)
                  ? product.price
                  : (typeof product.pricePerHour === 'number' && product.pricePerHour > 0)
                    ? product.pricePerHour
                    : (typeof product.pricePerMonth === 'number' && product.pricePerMonth > 0)
                      ? product.pricePerMonth
                      : null;

              return (
                <Link
                  key={product._id ?? product.id ?? idx}
                  href={`/properties/${product._id ?? product.id ?? ''}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full"
                >
                  <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                      <Package size={32} />
                    </div>
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                        product.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-black font-bold text-sm shadow-sm border border-gray-100">
                      {candidate ? (
                        <>
                          ₹{candidate.toLocaleString()}<span className="text-[10px] text-gray-400 font-normal">/day</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">Contact</span>
                      )}
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {product.category}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1 line-clamp-1 group-hover:text-black transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center text-gray-500 mt-2 gap-1.5 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{product.location}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-50 mt-auto flex justify-between items-center">
                      <span className="text-xs font-bold text-black uppercase tracking-tight">View Details</span>
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors text-gray-400">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
