'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { orderService } from '@/services/api';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    setRawResponse(null);
    try {
      const data = await orderService.getMyOrders();

      // Accept multiple response shapes: array, { data }, { orders }, single order, envelope
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.orders)
        ? data.orders
        : Array.isArray(data?.items)
        ? data.items
        : null;

      if (list) {
        setOrders(list);
      } else if (data?.order && data.order._id) {
        setOrders([data.order]);
      } else if (data?.success && Array.isArray(data?.data)) {
        setOrders(data.data);
      } else if (data?.success === false) {
        setError(data?.message || 'Failed to fetch orders');
      } else {
        // unexpected shape — keep for debugging
        setOrders([]);
        setRawResponse(data);
        console.debug('getMyOrders returned unexpected shape', data);
      }
    } catch (err: any) {
      console.error('Failed to fetch orders', err);
      setError(err?.response?.data?.message || 'Failed to fetch orders');
      setRawResponse(err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500">View and track your rental requests and confirmed orders.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-red-700 text-sm">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <div className="text-gray-400 mb-4 font-medium">No orders found.</div>
                <button onClick={() => fetchOrders()} className="bg-black text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition">
                  Refresh Orders
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((o: any) => {
                  const getStatusStyle = (status: string) => {
                    switch (status?.toLowerCase()) {
                      case 'draft': return 'bg-gray-100 text-gray-700';
                      case 'confirmed': return 'bg-blue-50 text-blue-700';
                      case 'picked up': return 'bg-purple-50 text-purple-700';
                      case 'returned': return 'bg-green-50 text-green-700';
                      case 'late': return 'bg-red-50 text-red-700';
                      default: return 'bg-gray-50 text-gray-600';
                    }
                  };

                  return (
                    <div key={o._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-900">Order #{o._id?.slice(-8).toUpperCase()}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(o.status)}`}>
                              {o.status || 'Pending'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 font-medium">₹{o.totalAmount?.toLocaleString()} • {new Date(o.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <Link 
                            href={`/orders/${o._id}`} 
                            className="text-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition"
                          >
                            View Details
                          </Link>

                          { (o.invoice || o.invoiceId) && (
                            <button
                              onClick={async () => {
                                try {
                                  const id = o.invoice?._id || o.invoiceId;
                                  if (!id) return;
                                  const blob = await (await import('@/services/api')).invoiceService.download(id);
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `invoice-${id}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();
                                  window.URL.revokeObjectURL(url);
                                } catch (err) {
                                  console.error(err);
                                  (await import('react-hot-toast')).toast.error('Failed to download invoice');
                                }
                              }}
                              className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold"
                            >Download Invoice</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
