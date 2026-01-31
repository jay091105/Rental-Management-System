'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService, rentalService, reviewService } from '@/services/api';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { MapPin, Calendar, Shield, Info, Package, Star } from 'lucide-react';

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
