'use client';

import { useState, useEffect } from 'react';
import { propertyService, rentalService } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { LayoutDashboard, Package, ClipboardList, Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    rentals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [properties, rentalsResp] = await Promise.all([
          (await import('@/services/api')).providerService.getProducts(),
          (await import('@/services/api')).providerService.getRentals(),
        ]);

        setStats({
          properties: properties?.length || 0,
          rentals: rentalsResp?.count || rentalsResp?.data?.length || 0,
        });
      } catch (err) {
        console.error('Failed to fetch provider data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loading />;

  const cards = [
    { title: 'My Products', value: stats.properties, icon: Package, description: 'Products you have listed for rent', link: '/provider/products' },
    { title: 'Rental Requests', value: stats.rentals, icon: ClipboardList, description: 'Incoming and active rental orders', link: '/provider/orders' },
  ];

  return (
    <ProtectedRoute allowedRoles={['provider', 'admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Provider Dashboard</h1>
            <p className="text-sm text-gray-500 text-sm">Welcome back, {user?.name || 'Partner'}. Here's an overview of your business.</p>
          </div>
          <Link
            href="/properties/add"
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <Link key={card.title} href={card.link} className="group">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <span className="text-4xl font-bold tracking-tighter text-gray-900">{card.value}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {card.title}
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
