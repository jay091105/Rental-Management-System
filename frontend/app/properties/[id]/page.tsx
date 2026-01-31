'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { propertyService, rentalService, reviewService } from '@/services/api';
import { Property, Review } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import Link from 'next/link';
import {
  MapPin,
  Shield,
  Package,
  Star,
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function PropertyDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentalLoading, setRentalLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rentalDuration, setRentalDuration] = useState<'HOUR' | 'DAY' | 'MONTH'>('DAY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchPropertyAndReviews = async () => {
      try {
        const [propertyData, reviewsData] = await Promise.all([
          propertyService.getById(id),
          reviewService.getPropertyReviews(id),
        ]);
        setProperty(propertyData);
        setReviews(reviewsData.data || []);
      } catch (err) {
        console.error('Failed to fetch property details:', err);
        toast.error('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPropertyAndReviews();
  }, [id]);

  const addToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setRentalLoading(true);
    try {
      await rentalService.create({
        productId: id,
        startDate,
        endDate,
        quantity,
        rentalDuration,
      });
      toast.success('Rental request sent successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create rental.');
    } finally {
      setRentalLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to leave a review');
      return;
    }
    setReviewLoading(true);
    try {
      await reviewService.addReview({
        productId: id,
        ...reviewForm,
      });
      toast.success('Review added successfully');
      // Refresh reviews and property
      const [propertyData, reviewsData] = await Promise.all([
        propertyService.getById(id),
        reviewService.getPropertyReviews(id),
      ]);
      setProperty(propertyData);
      setReviews(reviewsData.data || []);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      console.error('Failed to add review:', err);
      toast.error('Failed to add review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!property) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-4">Property not found</p>
          <Link href="/">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
              Go Back Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const price =
    rentalDuration === 'HOUR'
      ? property.pricePerHour
      : rentalDuration === 'MONTH'
      ? property.pricePerMonth
      : property.pricePerDay;

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return price;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return (price * diffDays + (property.deliveryCharges || 0) + (property.deposit || 0)) * quantity;
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-100 z-10 sticky top-0">
        <div className="container-custom py-4">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={18} />
            <span>Back to Properties</span>
          </Link>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
            <div className="p-8 bg-gray-50/50">
              <div className="space-y-4 sticky top-28">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
                  {property.images && property.images.length > 0 ? (
                    <Image
                      src={property.images[selectedImage]}
                      alt={property.title}
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
                  {property.availableUnits > 0 ? (
                    <span className="absolute top-4 right-4 px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
                      In Stock
                    </span>
                  ) : (
                    <span className="absolute top-4 right-4 px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
                      Out of Stock
                    </span>
                  )}
                </div>

                {property.images && property.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {property.images.slice(0, 4).map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImage === idx
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${property.title} ${idx + 1}`}
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

            <div className="p-8 lg:p-10 flex flex-col h-full">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                    {property.category}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold text-gray-900">
                      {property.averageRating || 0}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      ({property.numOfReviews || 0} reviews)
                    </span>
                  </div>
                </div>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                  {property.title}
                </h1>
                <p className="text-lg text-gray-500 font-medium mb-6">{property.brandName}</p>

                <div className="flex items-center gap-2 text-gray-600 mb-8">
                  <MapPin size={18} className="text-blue-500" />
                  <span className="font-medium">{property.location}</span>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                        Select Plan
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['HOUR', 'DAY', 'MONTH'].map((dur: string) => (
                          <button
                            key={dur}
                            onClick={() => setRentalDuration(dur as 'HOUR' | 'DAY' | 'MONTH')}
                            className={`py-2 px-4 rounded-xl text-sm font-bold transition-all ${
                              rentalDuration === dur
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {dur.charAt(0) + dur.slice(1).toLowerCase()}ly
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          Start
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                          End
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Quantity
                        </label>
                        <span className="text-xs text-blue-600 font-medium">
                          {property.availableUnits} available
                        </span>
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
                          onClick={() => setQuantity(Math.min(property.availableUnits, quantity + 1))}
                          disabled={quantity >= property.availableUnits}
                          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 px-2 mb-8">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Base Rate</span>
                    <span className="font-medium">
                      ₹{price}/{rentalDuration.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Deposit (Refundable)</span>
                    <span className="font-medium">₹{property.deposit || 0}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <span className="block text-3xl font-extrabold text-blue-700 leading-none">
                        ₹{totalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={addToCart}
                  disabled={rentalLoading || property.availableUnits === 0}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  {rentalLoading ? 'Processing...' : 'Rent Now'}
                </button>
              </div>

              <div className="mt-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-emerald-500" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">
                    Verified
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck size={20} className="text-blue-500" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">
                    Fast Delivery
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-purple-500" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">
                    Quality Check
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Guest Reviews</h3>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500 justify-end">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-xl font-bold text-gray-900">
                        {property.averageRating || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">
                      Based on {property.numOfReviews || 0} reviews
                    </p>
                  </div>
                </div>
              </div>

              {isAuthenticated && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-12"
                >
                  <h4 className="text-lg font-bold text-gray-900 mb-6">Write a review</h4>
                  <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star: number) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`transition-all ${
                          reviewForm.rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200'
                        }`}
                      >
                        <Star className={`w-8 h-8 ${reviewForm.rating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share your experience..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none mb-6 min-h-[120px]"
                  />
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all"
                  >
                    {reviewLoading ? 'Posting...' : 'Post Review'}
                  </button>
                </form>
              )}

              <div className="space-y-8">
                {reviews.length > 0 ? (
                  reviews.map((review: Review) => (
                    <div key={review._id} className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {review.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{review.user?.name || 'User'}</p>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i: number) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating ? 'fill-current' : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
