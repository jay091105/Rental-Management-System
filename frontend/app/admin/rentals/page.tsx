'use client';

import { useState, useEffect } from 'react';
import { rentalService } from '@/services/api';
import { Booking as Rental } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import { ClipboardList, Check, X, Calendar, User, Package } from 'lucide-react';

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRentals = async () => {
    try {
      const data = await rentalService.getAll();
      setRentals(data);
    } catch (err) {
      console.error('Failed to fetch rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await rentalService.updateStatus(id, status);
      fetchRentals();
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
          <h1 className="text-3xl font-bold text-gray-900">All Rentals</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Renter</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rentals.map((rental) => (
                <tr key={rental.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <Package className="w-4 h-4 text-gray-400" />
                      {rental.product?.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      {rental.renter?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {rental.startDate} - {rental.endDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rental.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      rental.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {rental.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {rental.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatus(rental.id, 'confirmed')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Confirm"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatus(rental.id, 'cancelled')}
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
