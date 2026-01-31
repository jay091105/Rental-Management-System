'use client';

import { useState, useEffect } from 'react';
import { productService, rentalService, userService } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { LayoutDashboard, Users, Package, ClipboardList, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  useEffect(() => {
    console.log("[ADMIN DASHBOARD] Mounted");
  }, []);

  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    rentals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, properties, rentals] = await Promise.all([
          userService.getAll(),
          productService.getAll(),
          rentalService.getAll(),
        ]);
        setStats({
          users: users.length,
          properties: properties.length,
          rentals: rentals.length,
        });
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loading />;

  const cards = [
    { title: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/users' },
    { title: 'Total Properties', value: stats.properties, icon: Package, color: 'text-green-600', bg: 'bg-green-50', link: '/properties' },
    { title: 'Total Rentals', value: stats.rentals, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/rentals' },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-12">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-xl text-white">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
