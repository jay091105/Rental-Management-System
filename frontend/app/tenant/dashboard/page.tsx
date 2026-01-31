'use client';

import { useState, useEffect } from 'react';
import { propertyService, bookingService } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { LayoutDashboard, Building, ClipboardList, ArrowRight, Search } from 'lucide-react';

export default function TenantDashboard() {
  useEffect(() => {
    console.log("[TENANT DASHBOARD] Mounted");
  }, []);

  const [stats, setStats] = useState({
    availableProperties: 0,
    myBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [properties, bookings] = await Promise.all([
          propertyService.getAll(),
          bookingService.getAll(),
        ]);
        
        setStats({
          availableProperties: properties.length,
          myBookings: bookings.length,
        });
      } catch (err) {
        console.error('Failed to fetch tenant data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loading />;

  const cards = [
    { title: 'Available Properties', value: stats.availableProperties, icon: Building, color: 'text-blue-600', bg: 'bg-blue-50', link: '/properties' },
    { title: 'My Bookings', value: stats.myBookings, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50', link: '/bookings' },
  ];

  return (
    <ProtectedRoute allowedRoles={['tenant']}>
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 p-3 rounded-xl text-white">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Overview</h1>
          </div>
          <Link
            href="/properties"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Search className="w-5 h-5" />
            Browse Properties
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card) => (
            <Link key={card.title} href={card.link} className="group">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`${card.bg} ${card.color} p-3 rounded-xl`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <span className="text-4xl font-bold text-gray-900">{card.value}</span>
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-600">{card.title}</h3>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
