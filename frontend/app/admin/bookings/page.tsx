'use client';

import { useState, useEffect } from 'react';
import { bookingService } from '@/services/api';
import { Booking } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import { ClipboardList, Check, X, Calendar, User, Home } from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getAll();
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await bookingService.updateStatus(id, status);
      fetchBookings();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) return <Loading />;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="bg-purple-600 p-3 rounded-xl text-white">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Renter</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <Home className="w-4 h-4 text-gray-400" />
                      {booking.property?.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      {booking.renter?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {booking.startDate} - {booking.endDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatus(booking.id, 'confirmed')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Confirm"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatus(booking.id, 'cancelled')}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Cancel"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
