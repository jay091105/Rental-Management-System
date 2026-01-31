'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { propertyService, bookingService } from '@/services/api';
import { Property } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { MapPin, Calendar, Shield, Info, Building } from 'lucide-react';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await propertyService.getById(id as string);
        setProperty(data);
      } catch (err) {
        console.error('Failed to fetch property:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setBookingLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await bookingService.create({
        propertyId: id,
        ...dates,
      });
      setMessage({ type: 'success', text: 'Booking request sent successfully!' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create booking.' });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!property) return <div className="text-center py-20 text-gray-500">Property not found.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Left Column: Property Info */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-gray-200 rounded-2xl h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <Building className="w-24 h-24" />
          </div>
          {property.images?.[0] && (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-4xl font-bold text-gray-900">{property.title}</h1>
            <div className="text-2xl font-bold text-blue-600">${property.price}<span className="text-sm text-gray-500">/month</span></div>
          </div>
          <div className="flex items-center text-gray-600 space-x-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span className="text-lg">{property.location}</span>
          </div>
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {property.description}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Booking Card */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Book This Property
          </h3>

          {message.text && (
            <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Date</label>
              <input
                type="date"
                required
                value={dates.startDate}
                onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Move-out Date (Estimate)</label>
              <input
                type="date"
                required
                value={dates.endDate}
                onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={bookingLoading || property.status !== 'available'}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition ${
                bookingLoading || property.status !== 'available'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {bookingLoading ? 'Processing...' : property.status === 'available' ? 'Reserve Now' : 'Currently Rented'}
            </button>

            {!isAuthenticated && (
              <p className="text-center text-xs text-gray-500 mt-4">
                You need to <Link href="/login" className="text-blue-600 underline">login</Link> to book this property.
              </p>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Verified Listing</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
