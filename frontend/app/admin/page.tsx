'use client';

import { useState, useEffect } from 'react';
import { propertyService, bookingService, userService } from '@/services/api';
import { Property, Booking, User } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import { LayoutDashboard, Users, Building, ClipboardList, Check, X } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'properties' | 'bookings'>('bookings');
  const [data, setData] = useState<{
    users: User[];
    properties: Property[];
    bookings: Booking[];
  }>({ users: [], properties: [], bookings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [users, properties, bookings] = await Promise.all([
          userService.getAll(),
          propertyService.getAll(),
          bookingService.getAll(),
        ]);
        setData({ users, properties, bookings });
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleBookingStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await bookingService.updateStatus(id, status);
      // Refresh bookings
      const updatedBookings = await bookingService.getAll();
      setData(prev => ({ ...prev, bookings: updatedBookings }));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) return <Loading />;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-xl text-white">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your system entities from here.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === 'bookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === 'properties' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building className="w-5 h-5" />
            Properties
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {activeTab === 'bookings' && (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Property</th>
                  <th className="px-6 py-4">Renter</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">{booking.property?.title}</td>
                    <td className="px-6 py-4">{booking.renter?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{booking.startDate} - {booking.endDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
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
                            onClick={() => handleBookingStatus(booking.id, 'confirmed')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                            title="Confirm"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleBookingStatus(booking.id, 'cancelled')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
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
          )}

          {activeTab === 'properties' && (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">{property.title}</td>
                    <td className="px-6 py-4 text-gray-500">{property.location}</td>
                    <td className="px-6 py-4 text-blue-600 font-bold">${property.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                        property.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'users' && (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-bold capitalize bg-blue-100 text-blue-700">
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
