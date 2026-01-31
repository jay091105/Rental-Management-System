'use client';

import { useState, useEffect } from 'react';
import { bookingService } from '@/services/api';
import { Booking } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import { Calendar, Tag, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getMyBookings();
        setBookings(data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  if (loading) return <Loading />;

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">You haven&apos;t made any bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="flex items-center gap-6 w-full">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400">
                    {booking.property?.images?.[0] ? (
                      <img
                        src={booking.property.images[0]}
                        alt={booking.property.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Tag className="w-8 h-8" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">{booking.property?.title || 'Unknown Property'}</h3>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {booking.startDate} - {booking.endDate}
                    </p>
                    <p className="text-blue-600 font-bold">${booking.totalPrice}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                    {getStatusIcon(booking.status)}
                    <span className="capitalize font-medium text-gray-700">{booking.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
