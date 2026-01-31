'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { CartItem } from '@/types';
import { Trash2, ShoppingBag, ArrowLeft, Minus, Plus, CheckCircle2, CreditCard, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<Record<string, 'COD' | 'UPI'>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadCart();
  }, [user]);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const updatedCart = [...cart];
    updatedCart[index].quantity = quantity;
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const groupByVendor = () => {
    const groups: Record<string, CartItem[]> = {};
    cart.forEach(item => {
      const vendorId = item.product.owner._id;
      if (!groups[vendorId]) {
        groups[vendorId] = [];
      }
      groups[vendorId].push(item);
    });
    return groups;
  };

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((total, item) => {
      const price = item.rentalDuration === 'HOUR' ? item.product.pricePerHour :
                   item.rentalDuration === 'MONTH' ? item.product.pricePerMonth : item.product.pricePerDay;
      const days = Math.ceil((new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const itemTotal = (price * days + item.product.deliveryCharges + item.product.deposit) * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const items = cart.map(item => ({
        productId: item.productId,
        startDate: item.startDate,
        endDate: item.endDate,
        rentalDuration: item.rentalDuration,
        quantity: item.quantity
      }));

      const res = await api.post('/orders', { items, paymentMethods });
      toast.success('Order placed successfully! 🎉');
      localStorage.removeItem('cart');
      router.push(`/orders/${res.data._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const vendorGroups = groupByVendor();
  const grandTotal = Object.values(vendorGroups).reduce((sum, items) => sum + calculateTotal(items), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-200 rounded-full mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-lg">Add some amazing products to get started</p>
            <Link href="/">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(vendorGroups).map(([vendorId, items]) => {
              const vendor = items[0].product.owner;
              const total = calculateTotal(items);
              
              return (
                <div key={vendorId} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                    {vendor.companyLogo && (
                      <img 
                        src={`http://localhost:5000${vendor.companyLogo}`} 
                        alt={vendor.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-gray-600">{vendor.email}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                    <div className="flex gap-6">
                      {items[0].product.paymentOptions.includes('COD') && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`payment-${vendorId}`}
                            value="COD"
                            checked={paymentMethods[vendorId] === 'COD'}
                            onChange={(e) => setPaymentMethods({ ...paymentMethods, [vendorId]: 'COD' })}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                          />
                          <CreditCard className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">Cash on Delivery</span>
                        </label>
                      )}
                      {items[0].product.paymentOptions.includes('UPI') && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`payment-${vendorId}`}
                            value="UPI"
                            checked={paymentMethods[vendorId] === 'UPI'}
                            onChange={(e) => setPaymentMethods({ ...paymentMethods, [vendorId]: 'UPI' })}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                          />
                          <QrCode className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">UPI Payment</span>
                        </label>
                      )}
                    </div>
                    {paymentMethods[vendorId] === 'UPI' && vendor.paymentQRCode && (
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-blue-200 text-center">
                        <p className="text-sm font-medium mb-3 text-gray-700">Scan QR Code to Pay</p>
                        <img 
                          src={vendor.paymentQRCode} 
                          alt="Payment QR Code"
                          className="w-48 h-48 mx-auto rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  {items.map((item, idx) => {
                    const globalIdx = cart.findIndex(c => 
                      c.productId === item.productId && 
                      c.startDate === item.startDate &&
                      c.endDate === item.endDate
                    );
                    const price = item.rentalDuration === 'HOUR' ? item.product.pricePerHour :
                                 item.rentalDuration === 'MONTH' ? item.product.pricePerMonth : item.product.pricePerDay;
                    const days = Math.ceil((new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / (1000 * 60 * 60 * 24));
                    const itemTotal = (price * days + item.product.deliveryCharges + item.product.deposit) * item.quantity;

                    return (
                      <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg mb-4 border border-gray-200">
                        {item.product.photos && item.product.photos.length > 0 && (
                          <img
                            src={`http://localhost:5000${item.product.photos[0]}`}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{item.product.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{item.product.brandName}</p>
                          <p className="text-sm text-gray-600 mb-3">
                            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1">
                              <button
                                onClick={() => updateQuantity(globalIdx, item.quantity - 1)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(globalIdx, item.quantity + 1)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(globalIdx)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">₹{itemTotal}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ₹{price}/{item.rentalDuration.toLowerCase()} × {days} days
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">Vendor Total:</span>
                      <span className="text-2xl font-bold text-gray-900">₹{total}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span className="font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-3xl font-extrabold text-gray-900">₹{grandTotal}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading || Object.keys(paymentMethods).length !== Object.keys(vendorGroups).length}
                className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Place Order
                  </>
                )}
              </button>
              {Object.keys(paymentMethods).length !== Object.keys(vendorGroups).length && (
                <p className="text-sm text-red-600 mt-3 text-center">
                  Please select payment method for all vendors
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
