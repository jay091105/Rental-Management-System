'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService, rentalService, reviewService } from '@/services/api';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { MapPin, Calendar, Shield, Info, Package, Star } from 'lucide-react';
import Image from 'next/image';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentalLoading, setRentalLoading] = useState(false);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const [productData, reviewsData] = await Promise.all([
          productService.getById(id as string),
          reviewService.getProductReviews(id as string)
        ]);
        setProduct(productData);
        setReviews(reviewsData.data);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProductAndReviews();
  }, [id]);

  const handleRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setRentalLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await rentalService.create({
        productId: id,
        ...dates,
      });
      setMessage({ type: 'success', text: 'Rental request sent successfully!' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create rental.' });
    } finally {
      setRentalLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await reviewService.addReview({
        productId: id as string,
        ...reviewForm
      });
      // Refresh reviews and product (for rating)
      const [productData, reviewsData] = await Promise.all([
        productService.getById(id as string),
        reviewService.getProductReviews(id as string)
      ]);
      setProduct(productData);
      setReviews(reviewsData.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      console.error('Failed to add review:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Left Column: Product Info */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-gray-200 rounded-2xl h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <Package className="w-24 h-24" />
          </div>
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          )}
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-4">Product not found</p>
          <Link href="/">
            <button className="btn-primary">
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
  const totalPrice = (price * (days || 1) + product.deliveryCharges + product.deposit) * quantity;

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      {/* Breadcrumb / Back Navigation */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-100 z-10 sticky top-[80px]">
        <div className="container-custom py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors font-medium text-sm">
            <ArrowLeft size={18} />
            <span>Back to Products</span>
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{product.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.averageRating || 0) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.numOfReviews || 0} reviews)</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">${product.price}<span className="text-sm text-gray-500">/day</span></div>
          </div>
          <div className="flex items-center text-gray-600 space-x-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span className="text-lg">{product.location}</span>
          </div>
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {product.description}
            </p>
          </div>

          {/* Reviews Section */}
          <div className="pt-8 border-t border-gray-100">
            <h3 className="text-2xl font-bold mb-6">Reviews</h3>
            
            {/* Review Form */}
            {isAuthenticated && (
              <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-xl mb-8 space-y-4">
                <h4 className="font-semibold">Write a review</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`w-8 h-8 ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className={`w-full h-full ${reviewForm.rating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience with this product..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {reviewLoading ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}

            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">{review.user?.name || 'User'}</p>
                        <div className="flex text-yellow-400 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
              )}
      <div className="container-custom py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
            {/* Left Column: Images */}
            <div className="p-8 bg-gray-50/50">
              <div className="space-y-4 sticky top-28">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
                  {product.photos && product.photos.length > 0 ? (
                    <Image
                      src={`http://localhost:5000${product.photos[selectedImage]}`}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                  {product.availableUnits > 0 ? (
                    <span className="absolute top-4 right-4 px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
                      In Stock
                    </span>
                  ) : (
                    <span className="absolute top-4 right-4 px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
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
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-brand-500 ring-2 ring-brand-200' : 'border-transparent hover:border-gray-200'
                          }`}
                      >
                        <Image
                          src={`http://localhost:5000${photo}`}
                          alt={`${product.name} ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Booking Card */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Book This Product
          </h3>

          {message.text && (
            <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleRental} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={dates.startDate}
                onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Estimate)</label>
              <input
                type="date"
                required
                value={dates.endDate}
                onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={rentalLoading || product.status !== 'available'}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition ${
                rentalLoading || product.status !== 'available'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {rentalLoading ? 'Processing...' : product.status === 'available' ? 'Reserve Now' : 'Currently Rented'}
            </button>

            {!isAuthenticated && (
              <p className="text-center text-xs text-gray-500 mt-4">
                You need to <Link href="/login" className="text-blue-600 underline">login</Link> to book this product.
              </p>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Verified Listing</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Secure Payment</span>
            {/* Right Column: Details & Action */}
            <div className="p-8 lg:p-10 flex flex-col h-full">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold text-gray-900">4.8</span>
                    <span className="text-gray-400 text-sm">(120 reviews)</span>
                  </div>
                </div>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{product.name}</h1>
                <p className="text-xl text-gray-500 font-medium">{product.brandName}</p>
              </div>

              {product.description && (
                <div className="mb-8 prose prose-gray text-gray-600">
                  <p>{product.description}</p>
                </div>
              )}

              <div className="mt-auto space-y-6">
                {/* Configuration Panel */}
                <div className="bg-surface-50 rounded-2xl p-6 border border-gray-100">
                  <div className="space-y-5">
                    {/* Duration Selection */}
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Rental Duration</label>
                      <div className="flex gap-2">
                        {['HOUR', 'DAY', 'MONTH'].map((dur) => (
                          <button
                            key={dur}
                            onClick={() => setRentalDuration(dur as any)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${rentalDuration === dur
                              ? 'bg-white shadow-sm text-brand-600 ring-1 ring-brand-200'
                              : 'bg-transparent text-gray-500 hover:bg-gray-200/50'
                              }`}
                          >
                            {dur.charAt(0) + dur.slice(1).toLowerCase()}ly
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Start</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">End</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</label>
                        <span className="text-xs text-brand-600 font-medium">{product.availableUnits} available</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="flex-1 text-center font-bold text-gray-900">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(product.availableUnits, quantity + 1))}
                          disabled={quantity >= product.availableUnits}
                          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 px-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Base Rate</span>
                    <span className="font-medium">₹{price}/{rentalDuration.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span className="font-medium text-emerald-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Deposit (Refundable)</span>
                    <span className="font-medium">₹{product.deposit}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <span className="block text-3xl font-extrabold text-brand-700 leading-none">₹{totalPrice}</span>
                      <span className="text-xs text-gray-400 font-medium">Including all taxes</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-4 pt-4">
                  <button
                    onClick={addToCart}
                    disabled={product.availableUnits === 0}
                    className="btn-primary w-full py-4 text-lg shadow-brand-500/30 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Rent Now
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2">
                    By renting this product you agree to our terms of service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Value Props */}
          <div className="border-t border-gray-100 bg-gray-50/50 p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Damage Protection</h4>
                <p className="text-xs text-gray-500">Covered up to ₹10,000</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100/50 flex items-center justify-center text-green-600">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Instant Delivery</h4>
                <p className="text-xs text-gray-500">Within 24 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100/50 flex items-center justify-center text-purple-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Quality Checked</h4>
                <p className="text-xs text-gray-500">Verified by experts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
