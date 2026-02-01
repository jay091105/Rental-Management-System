'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService, rentalService, reviewService, orderService, quotationService } from '@/services/api';
import { Product, Review } from '@/types';
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
import { isLikelyImageUrl, normalizeImageSrc } from '@/lib/image';
import toast from 'react-hot-toast';

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentalLoading, setRentalLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rentalDuration, setRentalDuration] = useState<'HOUR' | 'DAY' | 'MONTH'>('DAY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [availability, setAvailability] = useState<number | null>(null);
  const [orderQty, setOrderQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const [productData, reviewsData] = await Promise.all([
          productService.getById(id),
          reviewService.getProductReviews(id),
        ]);
        setProduct(productData);
        setReviews(reviewsData.data || []);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProductAndReviews();
  }, [id]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!startDate || !endDate) {
        setAvailability(null);
        return;
      }
      try {
        const res = await productService.getAvailability(id, startDate, endDate);
        setAvailability(res?.data?.availableUnits ?? null);
      } catch (err) {
        console.error('Failed to fetch availability', err);
        setAvailability(null);
      }
    };
    fetchAvailability();
  }, [startDate, endDate, id]);

  const addToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setRentalLoading(true);
    try {
      const resp = await rentalService.create({
        productId: id,
        startDate,
        endDate,
        quantity,
        rentalDuration,
      });

      const order = resp?.order || resp?.data?.order;
      if (order && order._id) {
        toast.success('Request submitted — provider notified.');
        router.push('/orders');
        return;
      }

      if (resp?.success) {
        toast.success('Rental request sent successfully!');
        router.push('/rentals');
        return;
      }

      toast.success('Rental request sent');
      router.push('/rentals');
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
      const [productData, reviewsData] = await Promise.all([
        productService.getById(id),
        reviewService.getProductReviews(id),
      ]);
      setProduct(productData);
      setReviews(reviewsData.data || []);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err: any) {
      console.error('Failed to add review:', err);
      const msg = err?.response?.data?.message || 'Failed to add review';
      toast.error(msg);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-4">Product not found</p>
          <Link href="/properties">
            <button className="bg-black text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition">
              Back to Catalog
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const price =
    rentalDuration === 'HOUR'
      ? product?.pricePerHour
      : rentalDuration === 'MONTH'
      ? product?.pricePerMonth
      : product?.pricePerDay;

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return price;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return (Number(price || 0) * diffDays + (product?.deliveryCharges || 0) + (product?.deposit || 0)) * quantity;
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="border-b border-gray-100 sticky top-16 z-30 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Catalog</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Images */}
          <div className="space-y-6">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100">
              {product.images && product.images.length > 0 ? (
                (() => {
                  const raw = product.images[selectedImage];
                  const safe = isLikelyImageUrl(raw) ? (normalizeImageSrc(raw) ?? raw) : '/file.svg';
                  return (
                    <Image
                      src={safe}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  );
                })()
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-gray-200" />
                </div>
              )}
            </div>

            {product?.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-black'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    {(() => {
                      const safe = isLikelyImageUrl(img) ? (normalizeImageSrc(img) ?? img) : '/file.svg';
                      return (
                        <Image
                          src={safe}
                          alt={`${product.title} ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      );
                    })()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Rental Config */}
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                    {product?.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold text-gray-900">{product?.averageRating || 0}</span>
                    <span className="text-xs text-gray-400 font-medium">({product?.numOfReviews || 0} reviews)</span>
                  </div>
                </div>
                {(user && (user.role === 'admin' || product?.owner === user._id || product?.owner?.toString?.() === user._id || product?.ownerId === user._id)) && (
                  <Link href={`/properties/${id}/edit`} className="text-sm font-bold text-black underline underline-offset-4">Edit Details</Link>
                )}
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight">{product.title}</h1>
              <div className="flex items-center text-gray-500 gap-1.5 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{product?.location}</span>
                <span className="mx-2 text-gray-300">•</span>
                <span>{product.brandName}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-baseline justify-between mb-8">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Price per {rentalDuration.toLowerCase()}</p>
                  <div className="text-4xl font-bold text-gray-900">₹{Number(price || 0).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                    ((availability ?? product.availableUnits) || 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {((availability ?? product.availableUnits) || 0) > 0 ? `${availability ?? product.availableUnits} available` : 'Out of stock'}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 ml-1">End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none transition-all" />
                  </div>
                </div>

                <div className="flex items-center justify-between py-6 border-t border-gray-200/50">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500">Units</label>
                    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"><Minus size={14} /></button>
                      <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                      <button onClick={() => setQuantity(Math.min((availability ?? product!.availableUnits), quantity + 1))} className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"><Plus size={14} /></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium mb-1">Estimated Total</p>
                    <p className="text-2xl font-bold text-black">₹{totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={addToCart} 
                    disabled={rentalLoading || ((availability ?? product?.availableUnits) || 0) === 0 || !startDate || !endDate || new Date(startDate) > new Date(endDate) || quantity > ((availability ?? product?.availableUnits) || 0)} 
                    className="col-span-2 bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg"
                  >
                    <ShoppingCart size={20} />
                    {rentalLoading ? 'Processing...' : 'Rent Now'}
                  </button>
                  
                  {isAuthenticated && (
                    <>
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
                            toast.error('Select valid dates first');
                            return;
                          }
                          try {
                            const data = await orderService.create({ productId: product?._id, quantity, rentalStart: startDate, rentalEnd: endDate });
                            if (data?.success || data?.order) {
                              toast.success('Order requested');
                              router.push('/orders');
                            }
                          } catch (err: any) {
                            toast.error(err?.response?.data?.message || 'Failed to create order');
                          }
                        }}
                        className="bg-white border border-gray-200 text-black py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm"
                      >
                        Request Order
                      </button>
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
                            toast.error('Select valid dates first');
                            return;
                          }
                          try {
                            const data = await quotationService.create({ productId: product?._id, quantity, rentalStart: startDate, rentalEnd: endDate });
                            if (data?.success) {
                              toast.success('Quotation requested');
                              router.push('/quotations');
                            }
                          } catch (err: any) {
                            toast.error(err?.response?.data?.message || 'Failed to request quote');
                          }
                        }}
                        className="bg-white border border-gray-200 text-black py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm"
                      >
                        Request Quote
                      </button>
                    </>
                  )}
                </div>
                <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest">Provider confirmation required</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 py-8 border-y border-gray-100">
              <div className="flex flex-col gap-1 text-center">
                <Shield className="w-5 h-5 mx-auto text-gray-400 mb-2" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deposit</span>
                <span className="text-sm font-bold text-gray-900">₹{product?.deposit || 0}</span>
              </div>
              <div className="flex flex-col gap-1 text-center border-x border-gray-100">
                <Truck className="w-5 h-5 mx-auto text-gray-400 mb-2" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery</span>
                <span className="text-sm font-bold text-gray-900">₹{product?.deliveryCharges || 0}</span>
              </div>
              <div className="flex flex-col gap-1 text-center">
                <CheckCircle2 className="w-5 h-5 mx-auto text-gray-400 mb-2" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quality</span>
                <span className="text-sm font-bold text-emerald-600">Verified</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Product Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 border-t border-gray-100 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-8">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-yellow-500">
                      <Star className="w-6 h-6 fill-current" />
                      <span className="text-3xl font-bold text-gray-900">{product?.averageRating || 0}</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Based on {product?.numOfReviews || 0} global ratings</p>
                  </div>
                </div>

                {isAuthenticated && (
                  <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-6">Write a Review</h4>
                    <div className="flex gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className={`transition-all ${reviewForm.rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}
                        >
                          <Star className={`w-8 h-8 ${reviewForm.rating >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      required
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="What was your experience like?"
                      className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black outline-none mb-6 min-h-[120px] text-sm"
                    />
                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all"
                    >
                      {reviewLoading ? 'Posting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review: Review) => (
                  <div key={review._id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition hover:shadow-md">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                          {review.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{review.user?.name || 'User'}</p>
                          <div className="flex text-yellow-400 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-100'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
