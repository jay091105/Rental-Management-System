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

  // Fetch availability when dates change
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

      // Backend now returns the created Order when a rental request is made (status: pending)
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

      // Fallback
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
      // Refresh reviews and product
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
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-4">Product not found</p>
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
    <div className="min-h-screen bg-surface-50 pb-20">
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-100 z-10 sticky top-0">
        <div className="container-custom py-4">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={18} />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
            <div className="p-8 bg-gray-50/50">
              <div className="space-y-4 sticky top-28">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
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

                {product?.images && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {product.images.slice(0, 4).map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImage === idx
                            ? 'border-blue-500 ring-2 ring-blue-200'
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
            </div>

            <div className="p-6 lg:p-10 flex flex-col gap-8">
              {/* Header: meta, title, location */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{product?.category}</span>
                    <div className="flex items-center gap-2 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold text-gray-900">{product?.averageRating || 0}</span>
                      <span className="text-xs text-gray-400">({product?.numOfReviews || 0})</span>
                    </div>
                  </div>

                  {(user && (user.role === 'admin' || product?.owner === user._id || product?.owner?.toString?.() === user._id || product?.ownerId === user._id)) && (
                    <Link href={`/properties/${id}/edit`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium">Edit</Link>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">{product.title}</h1>
                <p className="text-sm text-gray-500 mt-2">{product.brandName} • <span className="font-medium">{product?.location}</span></p>
              </div>

              {/* Right-hand sticky summary (visual lift to match inspiration) */}
              <div className="lg:col-start-2 lg:row-start-1">
                <div className="sticky top-28">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg w-full max-w-md">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="text-3xl font-extrabold text-gray-900 mt-1">₹{Number(price || 0).toLocaleString()}</div>
                        <div className="text-sm text-gray-400">per {rentalDuration.toLowerCase()}</div>
                        <div className="mt-2 inline-flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                          {((availability ?? product.availableUnits) || 0) > 0 ? `${availability ?? product.availableUnits} available` : 'Out of stock'}
                        </div>
                      </div>
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-xs font-medium text-gray-500">Start</label>
                        <label className="text-xs font-medium text-gray-500">End</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" />
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs text-gray-500">Quantity</div>
                          <div className="mt-2 flex items-center gap-2">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">-</button>
                            <div className="w-12 text-center font-bold">{quantity}</div>
                            <button onClick={() => setQuantity(Math.min((availability ?? product!.availableUnits), quantity + 1))} className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">+</button>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-gray-500">Estimated total</div>
                          <div className="text-lg font-bold text-blue-700">₹{totalPrice}</div>
                        </div>
                      </div>

                      <div>
                        <button onClick={addToCart} disabled={rentalLoading || ((availability ?? product?.availableUnits) || 0) === 0 || !startDate || !endDate || new Date(startDate) > new Date(endDate) || quantity > ((availability ?? product?.availableUnits) || 0)} className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                          <ShoppingCart size={18} />
                          {rentalLoading ? 'Processing…' : 'Rent Now'}
                        </button>
                      </div>

                      <div className="mt-3 text-center text-xs text-gray-400">You won't be charged yet — provider will confirm availability.</div>
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-4 text-sm text-gray-600 space-y-2">
                      <div className="flex items-center justify-between"><span>Deposit</span><span className="font-medium">₹{product?.deposit || 0}</span></div>
                      <div className="flex items-center justify-between"><span>Delivery</span><span className="font-medium">₹{product?.deliveryCharges || 0}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-emerald-500" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Verified</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck size={20} className="text-blue-500" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-purple-500" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">Quality Check</span>
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
                {product.description}
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
                        {product?.averageRating || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">
                      Based on {product?.numOfReviews || 0} reviews
                    </p>
                  </div>
                </div>
              </div>

              {isAuthenticated && (
                <>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
                  <h4 className="text-lg font-bold mb-3">Request Order / Quote</h4>
                  <div className="flex gap-3 items-center">
                    <input
                      type="number"
                      min={1}
                      value={orderQty}
                      onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value || 1)))}
                      id="orderQty"
                      className="w-28 p-2 border rounded"
                    />

                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        const qty = orderQty;

                        if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
                          toast.error('Please select valid start and end dates before requesting an order');
                          return;
                        }
                        if (availability !== null && qty > availability) {
                          toast.error('Requested quantity exceeds availability for selected dates');
                          return;
                        }

                        try {
                          const data = await orderService.create({ productId: product?._id, quantity: qty, rentalStart: startDate, rentalEnd: endDate });
                          if (data?.success || data?.order) {
                            toast.success('Order requested successfully');
                            router.push('/orders');
                          } else {
                            toast.error(data?.message || 'Failed to create order');
                          }
                        } catch (err: any) {
                          console.error(err);
                          toast.error(err?.response?.data?.message || 'Failed to create order');
                        }
                      }}
                      disabled={!startDate || !endDate || new Date(startDate) > new Date(endDate) || (availability !== null && orderQty > availability)}
                      className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >Request Order</button>

                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        const qty = orderQty;

                        if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
                          toast.error('Please select valid start and end dates before requesting a quotation');
                          return;
                        }
                        if (availability !== null && qty > availability) {
                          toast.error('Requested quantity exceeds availability for selected dates');
                          return;
                        }

                        try {
                          const data = await quotationService.create({ productId: product?._id, quantity: qty, rentalStart: startDate, rentalEnd: endDate });
                          if (data?.success) {
                            toast.success('Quotation requested successfully');
                            router.push('/quotations');
                          } else {
                            toast.error(data?.message || 'Failed to request quotation');
                          }
                        } catch (err: any) {
                          console.error(err);
                          toast.error(err?.response?.data?.message || 'Failed to request quotation');
                        }
                      }}
                      disabled={!startDate || !endDate || new Date(startDate) > new Date(endDate) || (availability !== null && orderQty > availability)}
                      className="bg-gray-900 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>

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
                </>
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
