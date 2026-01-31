'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Package, ClipboardList } from 'lucide-react';

type Stats = {
  properties: number;
  rentals: number;
};

export default function ProviderDashboardPage() {
  // mock stats (replace with API later)
  const stats: Stats = {
    properties: 12,
    rentals: 5,
  };

  // ✅ ARRAY IS NOW CLOSED PROPERLY
  const cards = [
    {
      title: 'My Products',
      value: stats.properties,
      icon: Package,
      color: 'text-green-600',
      bg: 'bg-green-50',
      link: '/provider/products',
    },
    {
      title: 'Rental Requests',
      value: stats.rentals,
      icon: ClipboardList,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      link: '/provider/orders',
    },
  ];

  // ✅ return is now in the correct place
  return (
    <ProtectedRoute allowedRoles={['provider', 'admin']}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Provider Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.title}
                href={card.link}
                className={`rounded-xl p-6 shadow-sm border hover:shadow-md transition ${card.bg}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${card.color}`} />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
