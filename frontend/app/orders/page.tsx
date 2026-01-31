'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/my');
        const data = await res.json();
        if (data.success) setOrders(data.data || []);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-gray-600 mt-2">Orders you have requested.</p>

        {loading ? (
          <div className="mt-6">Loading...</div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <div className="text-gray-500">No orders found.</div>
            ) : (
              orders.map(o => (
                <div key={o._id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold">Order #{o._id}</div>
                      <div className="text-xs text-gray-500">Amount: ${o.totalAmount}</div>
                      <div className="text-xs text-gray-400">Status: {o.status}</div>
                    </div>
                    <div>
                      <a href={`/orders/${o._id}`} className="text-blue-600">View</a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
