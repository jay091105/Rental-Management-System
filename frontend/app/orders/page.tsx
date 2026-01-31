'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Order, Booking } from '@/types';
import { Download, Eye, Package, Truck, CheckCircle, XCircle, Calendar, Receipt, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const endpoint = user?.role === 'VENDOR' ? '/orders/vendor-orders' : '/orders/my-orders';
      const res = await api.get(endpoint);
      setOrders(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (bookingId: string) => {
    try {
      const res = await api.get(`/bookings/${bookingId}/invoice`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded successfully! 📄');
    } catch (error: any) {
      toast.error('Failed to download invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'OUT_FOR_DELIVERY':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">Track and manage all your orders</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <Receipt className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">{orders.length} Orders</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Package size={40} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-8">Start shopping to see your orders here</p>
            <Link href="/">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const bookings = Array.isArray(order.bookings) ? order.bookings : [];
              return (
                <div key={order._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {bookings.map((booking: Booking) => {
                    const product = typeof booking.product === 'object' ? booking.product : null;
                    const vendor = typeof booking.vendor === 'object' ? booking.vendor : null;
                    
                    return (
                      <div key={booking._id} className="border border-gray-200 rounded-lg p-5 mb-4 bg-gray-50">
                        <div className="flex gap-5">
                          {product?.photos && product.photos.length > 0 && (
                            <img
                              src={`http://localhost:5000${product.photos[0]}`}
                              alt={product.name}
                              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-1">{product?.name}</h4>
                            <p className="text-gray-600 mb-2">{product?.brandName} • {product?.category}</p>
                            {vendor && (
                              <p className="text-sm text-gray-600 mb-3">
                                <span className="font-semibold">Vendor:</span> {vendor.name}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                                {booking.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-gray-900 mb-4">₹{booking.totalPrice}</p>
                            <div className="flex flex-col gap-2">
                              <Link
                                href={`/orders/${booking._id}/track`}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                              >
                                <Eye size={16} />
                                Track
                              </Link>
                              <button
                                onClick={() => downloadInvoice(booking._id)}
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                              >
                                <Download size={16} />
                                Invoice
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-bold text-gray-900">₹{order.totalAmount}</span>
                  </div>
                  {user?.role === 'VENDOR' && (
                    <div className="mt-4">
                      <Link
                        href={`/orders/${order._id}/manage`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        Manage Order
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
