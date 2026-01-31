'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { Property } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [bookingData, setBookingData] = useState({ startDate: '', endDate: '' });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    api.get(`/properties/${id}`).then(res => setProperty(res.data));
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push('/login');

    try {
      const days = (new Date(bookingData.endDate).getTime() - new Date(bookingData.startDate).getTime()) / (1000 * 3600 * 24);
      if (days <= 0) throw new Error('Invalid dates');

      await api.post('/bookings', {
        propertyId: property?._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        totalPrice: days * (property?.price || 0)
      });
      alert('Booking successful!');
      router.push('/bookings');
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Booking failed');
    }
  };

  if (!property) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
        <h1 className="text-3xl font-bold">{property.title}</h1>
        <p className="text-xl text-blue-600 font-semibold mb-4">${property.price} / night</p>
        <p className="text-gray-700">{property.description}</p>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p><strong>Location:</strong> {property.location}</p>
          <p><strong>Host:</strong> {property.owner.name}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg border h-fit">
        <h2 className="text-xl font-bold mb-4">Book this property</h2>
        <form onSubmit={handleBooking} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Check-in</label>
            <input 
              type="date" 
              className="form-input" 
              required
              value={bookingData.startDate}
              onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Check-out</label>
            <input 
              type="date" 
              className="form-input" 
              required
              value={bookingData.endDate}
              onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full btn-primary py-3">
            {user ? 'Confirm Booking' : 'Login to Book'}
          </button>
        </form>
      </div>
    </div>
  );
}