'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { orderService } from '@/services/api';
import Loading from '@/components/Loading';

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviderOrders = async () => {
      try {
        const data = await orderService.getProviderOrders();
        // Accept either raw array or { success, data } envelope
        // Log response for debugging if empty
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : null);
        if (list) {
          setOrders(list);
        } else if (data?.success === false) {
          setError(data?.message || 'Failed to fetch provider orders');
        } else {
          // Unexpected shape, but continue with empty list
          console.debug('getProviderOrders returned unexpected shape', data);
          setOrders([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch provider orders', err);
        setError(err?.response?.data?.message || 'Failed to fetch provider orders');
      } finally {
        setLoading(false);
      }
    };
    fetchProviderOrders();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["provider", "admin"]}>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Rental & Order Requests</h1>
        <p className="text-gray-600 mt-2">Requests for your products.</p>

        {loading ? (
          <Loading />
        ) : error ? (
          <div className="mt-6 text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="mt-6 text-gray-500">No requests found.</div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((o: any) => (
              <div key={o._id} className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-semibold">Request #{o._id}</div>
                    <div className="text-xs text-gray-500">Product: {o.product?.title || o.product}</div>
                    <div className="text-xs text-gray-500">Amount: ₹{o.totalAmount}</div>
                    <div className="text-xs text-gray-400">Status: {o.status}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={`/orders/${o._id}`} className="text-blue-600">View</a>
                    {o.status === 'pending' && (
                      <>
                        <button
                          onClick={async () => {
                            if (!confirm('Approve this request?')) return;
                            try {
                              const res = await (await import('@/services/api')).orderService.updateStatus(o._id, 'confirmed');
                              if (res?.success) {
                                o.status = 'confirmed';
                                setOrders((prev) => prev.map(p => p._id === o._id ? { ...p, status: 'confirmed' } : p));
                                // Optional: create invoice or payment in future
                                (await import('react-hot-toast')).toast.success('Request approved');
                              } else {
                                (await import('react-hot-toast')).toast.error(res?.message || 'Failed to approve');
                              }
                            } catch (err: any) {
                              console.error(err);
                              (await import('react-hot-toast')).toast.error(err?.response?.data?.message || 'Failed to approve');
                            }
                          }}
                          className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg"
                        >Approve</button>
                        <button
                          onClick={async () => {
                            if (!confirm('Reject this request?')) return;
                            try {
                              const res = await (await import('@/services/api')).orderService.updateStatus(o._id, 'cancelled');
                              if (res?.success) {
                                o.status = 'cancelled';
                                setOrders((prev) => prev.map(p => p._id === o._id ? { ...p, status: 'cancelled' } : p));
                                (await import('react-hot-toast')).toast.success('Request rejected');
                              } else {
                                (await import('react-hot-toast')).toast.error(res?.message || 'Failed to reject');
                              }
                            } catch (err: any) {
                              console.error(err);
                              (await import('react-hot-toast')).toast.error(err?.response?.data?.message || 'Failed to reject');
                            }
                          }}
                          className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg"
                        >Reject</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}