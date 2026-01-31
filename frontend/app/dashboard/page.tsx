'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Booking } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      api.get('/bookings/my-bookings').then(res => setBookings(res.data));
    }
  }, [user, loading, router]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'CANCELLED' } : b));
    } catch (error) {
      alert('Cancellation failed');
    }
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
      <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {bookings.length === 0 ? (
          <p className="text-gray-500">You have no bookings yet.</p>
        ) : (
          bookings.map(b => (
            <div key={b._id} className="bg-white p-4 rounded shadow flex justify-between items-center border">
              <div>
                <h3 className="font-bold text-lg">{(b.property as any).title}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                </p>
                <p className="font-bold text-blue-600">${b.totalPrice}</p>
                <p className={`text-sm ${b.status === 'CONFIRMED' ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {b.status}
                </p>
              </div>
              {b.status === 'CONFIRMED' && (
                <button 
                  onClick={() => handleCancel(b._id)}
                  className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}