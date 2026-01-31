'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Product } from '@/types';
import { Search, ShoppingCart, Star, Shield, Truck, Clock, ArrowRight, Filter } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    brandName: '',
    colour: '',
    minPrice: '',
    maxPrice: '',
    duration: 'DAY' as 'HOUR' | 'DAY' | 'MONTH'
  });
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, [filters, search]);

  const fetchProducts = async () => {
    try {
      const params: any = { ...filters };
      if (search) params.search = search;
      const res = await api.get('/products', { params });
      setProducts(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = (product: Product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    const cartItem = {
      productId: product._id,
      product,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rentalDuration: filters.duration,
      quantity: 1
    };

    const updatedCart = [...cart, cartItem];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Added to cart! 🎉');
  };

  const categories = Array.from(new Set(products.map(p => p.category)));
  const brands = Array.from(new Set(products.map(p => p.brandName)));
  const colours = Array.from(new Set(products.map(p => p.colour).filter(Boolean)));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Rent Premium Products
              <span className="block text-blue-200">Without Breaking the Bank</span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Discover thousands of quality products available for rent. From electronics to vehicles, find what you need at affordable prices.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder="Search for products, brands, or categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-32 py-5 text-lg rounded-2xl border-0 shadow-xl text-gray-900 focus:ring-4 focus:ring-blue-300 outline-none"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold flex items-center gap-2 transition-colors"
                >
                  <Filter size={20} />
                  Filters
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{products.length}+</div>
                <div className="text-blue-200 text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-blue-200 text-sm">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-200 text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Your transactions are protected with industry-standard encryption</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery to your doorstep</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Duration</h3>
              <p className="text-gray-600">Rent for hours, days, or months - you choose</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Panel */}
      {showFilters && (
        <section className="bg-white border-b shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filters.brandName}
                onChange={(e) => setFilters({ ...filters, brandName: e.target.value })}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              <select
                value={filters.colour}
                onChange={(e) => setFilters({ ...filters, colour: e.target.value })}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">All Colors</option>
                {colours.map(colour => (
                  <option key={colour} value={colour}>{colour}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />

              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              />

              <select
                value={filters.duration}
                onChange={(e) => setFilters({ ...filters, duration: e.target.value as any })}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="HOUR">Per Hour</option>
                <option value="DAY">Per Day</option>
                <option value="MONTH">Per Month</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Browse our most popular rental items</p>
            </div>
            <Link href="/cart" className="hidden md:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              <ShoppingCart size={20} />
              View Cart ({cart.length})
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const price = filters.duration === 'HOUR' ? product.pricePerHour :
                             filters.duration === 'MONTH' ? product.pricePerMonth : product.pricePerDay;
                return (
                  <div key={product._id} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all duration-300 group">
                    <div className="relative overflow-hidden bg-gray-100">
                      {product.photos && product.photos.length > 0 ? (
                        <img
                          src={`http://localhost:5000${product.photos[0]}`}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      {product.availableUnits > 0 ? (
                        <span className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                          In Stock
                        </span>
                      ) : (
                        <span className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                          Out of Stock
                        </span>
                      )}
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-gray-700">4.8</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{product.category}</span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{product.brandName}</p>
                      {product.colour && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-gray-500">Color:</span>
                          <span className="text-xs font-medium text-gray-700">{product.colour}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-gray-900">₹{price}</span>
                            <span className="text-sm text-gray-500">/{filters.duration.toLowerCase()}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{product.availableUnits} units available</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/products/${product._id}`}
                          className="flex-1 text-center py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.availableUnits === 0}
                          className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Renting?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their rental needs
          </p>
          {!user && (
            <div className="flex gap-4 justify-center">
              <Link href="/register" className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-bold text-lg">
                Get Started
              </Link>
              <Link href="/login" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-bold text-lg">
                Login
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
