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
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Products</h1>
            <p className="text-gray-500">Find exactly what you need from our curated catalog.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {(user?.role === 'admin' || user?.role === 'provider') && (
              <Link
                href="/properties/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-md whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </Link>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No items found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="h-56 bg-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <Package className="w-16 h-16" />
                    </div>
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                        product.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl text-blue-600 font-extrabold shadow-lg">
                      {candidate ? (
                        <>
                          {'$'}{candidate.toLocaleString(undefined, { maximumFractionDigits: 2 })}<span className="text-[10px] text-gray-400 font-normal">/day</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 font-medium">Contact</span>
                      )}
                    </div>
                  </div>
                  <div className="p-6 space-y-4 flex-grow flex flex-col">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition truncate">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 gap-1.5 text-sm">
                        <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{product.location}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-50 mt-auto flex justify-between items-center">
                      <span className="text-blue-600 font-bold text-sm">View Details</span>
                      <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
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
