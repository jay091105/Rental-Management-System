'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { orderService } from '@/services/api';

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
      <div className="p-8">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-gray-600 mt-2">Orders you have requested.</p>

        {loading ? (
          <div className="mt-6">Loading...</div>
        ) : error ? (
          <div className="mt-6 text-red-600">{error}</div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <div>
                <div className="text-gray-500 mb-3">No orders found.</div>
                <div className="flex items-center gap-3">
                  <button onClick={() => fetchOrders()} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg">Refresh</button>
                  <button
                    onClick={async () => {
                      try {
                        const resp = await (await import('@/services/api')).orderService.getMyOrders();
                        console.debug('manual getMyOrders:', resp);
                        setRawResponse(resp);
                      } catch (err) {
                        console.error(err);
                        setRawResponse(err?.response?.data || err);
                      }
                    }}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg"
                  >Fetch & show API response</button>
                </div>

                {rawResponse && (
                  <details className="mt-4 bg-black/5 p-4 rounded-lg border border-dashed border-gray-200">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700">API response (debug)</summary>
                    <pre className="mt-3 max-h-80 overflow-auto text-xs text-gray-800">{JSON.stringify(rawResponse, null, 2)}</pre>
                  </details>
                )}
              </div>
            ) : (
              orders.map((o: any) => (
                <div key={o._id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold">Order #{o._id}</div>
                      <div className="text-xs text-gray-500">Amount: ₹{o.totalAmount}</div>
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
