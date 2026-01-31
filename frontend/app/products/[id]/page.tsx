'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Product } from '@/types';
import { ShoppingCart, Calendar, ArrowLeft, Star, Shield, Truck, CheckCircle2, Minus, Plus, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentalDuration, setRentalDuration] = useState<'HOUR' | 'DAY' | 'MONTH'>('DAY');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(nextWeek.toISOString().split('T')[0]);
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${params.id}`);
      setProduct(res.data);
    } catch (error: any) {
      toast.error('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    if (!product) return;

    const cartItem = {
      productId: product._id,
      product,
      startDate,
      endDate,
      rentalDuration,
      quantity
    };

    const savedCart = localStorage.getItem('cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart! 🎉');
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-2xl font-bold text-gray-700 mb-4">Product not found</p>
          <Link href="/">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Go Back Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const price = rentalDuration === 'HOUR' ? product.pricePerHour :
               rentalDuration === 'MONTH' ? product.pricePerMonth : product.pricePerDay;
  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = (price * days + product.deliveryCharges + product.deposit) * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Products</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                {product.photos && product.photos.length > 0 ? (
                  <img
                    src={`http://localhost:5000${product.photos[selectedImage]}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                {product.availableUnits > 0 ? (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg">
                    In Stock
                  </span>
                ) : (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                    Out of Stock
                  </span>
                )}
              </div>
              {product.photos && product.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.photos.slice(0, 4).map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={`http://localhost:5000${photo}`}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="mb-3">
                  <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">{product.category}</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                <p className="text-2xl text-gray-600 mb-4">{product.brandName}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-700">4.8</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{product.availableUnits} units available</span>
                </div>
              </div>

              {product.description && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              {/* Rental Details */}
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Rental Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rental Duration</label>
                    <select
                      value={rentalDuration}
                      onChange={(e) => setRentalDuration(e.target.value as any)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    >
                      <option value="HOUR">Per Hour</option>
                      <option value="DAY">Per Day</option>
                      <option value="MONTH">Per Month</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 hover:bg-gray-100 transition-all flex items-center justify-center"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="text-2xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.availableUnits, quantity + 1))}
                        disabled={quantity >= product.availableUnits}
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 hover:bg-gray-100 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Pricing Breakdown</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Rental Price:</span>
                    <span className="font-semibold">₹{price} per {rentalDuration.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Duration:</span>
                    <span className="font-semibold">{days} days</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charges:</span>
                    <span className="font-semibold">₹{product.deliveryCharges}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Deposit:</span>
                    <span className="font-semibold">₹{product.deposit}</span>
                  </div>
                  <div className="pt-3 border-t-2 border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total:</span>
                      <span className="text-3xl font-extrabold text-gray-900">₹{totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-100">
                  <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700">Secure</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center border border-green-100">
                  <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700">Fast Delivery</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center border border-purple-100">
                  <CheckCircle2 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700">Verified</p>
                </div>
              </div>

              <button
                onClick={addToCart}
                disabled={product.availableUnits === 0}
                className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
              >
                <ShoppingCart size={24} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
