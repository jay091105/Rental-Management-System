'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Order } from '@/types';
import { Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrder();
  }, [params.id, user]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${params.id}`);
      setOrder(res.data);
    } catch (error: any) {
      toast.error('Failed to fetch order');
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
      toast.success('Invoice downloaded');
    } catch (error: any) {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Order not found</p>
      </div>
    );
  }

  const bookings = Array.isArray(order.bookings) ? order.bookings : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">Order #{order._id.slice(-8)}</h1>
              <p className="text-gray-600 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full font-medium ${
              order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {order.status}
            </span>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {bookings.map((booking: any) => {
                const product = typeof booking.product === 'object' ? booking.product : null;
                const vendor = typeof booking.vendor === 'object' ? booking.vendor : null;

                return (
                  <div key={booking._id} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      {product?.photos && product.photos.length > 0 && (
                        <img
                          src={`http://localhost:5000${product.photos[0]}`}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{product?.name}</h3>
                        <p className="text-gray-600">{product?.brandName} • {product?.category}</p>
                        {vendor && (
                          <p className="text-sm text-gray-600 mt-1">Vendor: {vendor.name}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            booking.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'OUT_FOR_DELIVERY' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{booking.totalPrice}</p>
                        <div className="flex gap-2 mt-2">
                          <Link
                            href={`/orders/${booking._id}/track`}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
                          >
                            Track
                          </Link>
                          <button
                            onClick={() => downloadInvoice(booking._id)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition flex items-center gap-1"
                          >
                            <Download size={14} />
                            Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t mt-6 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
