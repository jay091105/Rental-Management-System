'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Booking } from '@/types';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const statusSteps = [
  { key: 'CONFIRMED', label: 'Order Confirmed', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
  { key: 'RETURNED', label: 'Returned', icon: CheckCircle }
];

export default function TrackOrderPage() {
  const params = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      // Get booking from orders
      const res = await api.get('/orders/my-orders');
      const allBookings = res.data.flatMap((order: any) => order.bookings || []);
      const found = allBookings.find((b: Booking) => b._id === params.id);
      if (found) {
        setBooking(found);
      }
    } catch (error: any) {
      toast.error('Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Booking not found</p>
      </div>
    );
  }

  const product = typeof booking.product === 'object' ? booking.product : null;
  const currentStatusIndex = statusSteps.findIndex(s => s.key === booking.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Your Order</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>
          {product && (
            <div className="flex gap-4">
              {product.photos && product.photos.length > 0 && (
                <img
                  src={`http://localhost:5000${product.photos[0]}`}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <div>
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-gray-600">{product.brandName}</p>
                <p className="text-sm text-gray-600">
                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Order Status</h2>
          
          <div className="relative">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={step.key} className="flex items-start mb-8 last:mb-0">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon size={24} />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.label}
                    </h3>
                    {isCurrent && booking.trackingUpdates && booking.trackingUpdates.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {booking.trackingUpdates
                          .filter(u => u.status === step.key)
                          .map((update, idx) => (
                            <p key={idx} className="text-sm text-gray-600">
                              {new Date(update.timestamp).toLocaleString()}: {update.message || update.status}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`absolute left-6 top-12 w-0.5 h-16 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    }`} style={{ marginLeft: '-1px' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tracking Updates */}
        {booking.trackingUpdates && booking.trackingUpdates.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">All Updates</h2>
            <div className="space-y-3">
              {booking.trackingUpdates.map((update, idx) => (
                <div key={idx} className="border-l-4 border-blue-600 pl-4 py-2">
                  <p className="font-medium">{update.status}</p>
                  {update.message && <p className="text-sm text-gray-600">{update.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(update.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
