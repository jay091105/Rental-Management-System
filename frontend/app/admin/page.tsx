'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    } else if (user?.role === 'ADMIN') {
      api.get('/admin/analytics').then(res => setAnalytics(res.data));
      api.get('/admin/bookings').then(res => setBookings(res.data));
    }
  }, [user, loading, router]);

  if (!analytics) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-6 rounded shadow">
          <p className="text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold">${analytics.totalRevenue}</p>
        </div>
        <div className="bg-green-100 p-6 rounded shadow">
          <p className="text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold">{analytics.totalBookings}</p>
        </div>
        <div className="bg-purple-100 p-6 rounded shadow">
          <p className="text-gray-600">Active Properties</p>
          <p className="text-2xl font-bold">{analytics.totalProperties}</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded shadow">
          <p className="text-gray-600">Total Users</p>
          <p className="text-2xl font-bold">{analytics.totalUsers}</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4">Property</th>
              <th className="p-4">Guest</th>
              <th className="p-4">Dates</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b: any) => (
              <tr key={b._id} className="border-b">
                <td className="p-4">{b.property.title}</td>
                <td className="p-4">{b.user.name}</td>
                <td className="p-4 text-sm">
                  {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                </td>
                <td className="p-4 font-bold">${b.totalPrice}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    b.status === 'CONFIRMED' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}