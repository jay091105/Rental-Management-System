'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { orderService, invoiceService } from '@/services/api';
import Loading from '@/components/Loading';

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [invoiceMap, setInvoiceMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  useEffect(() => {
    const fetchProviderOrders = async () => {
      try {
        const data = await orderService.getProviderOrders();
        // Accept multiple possible response shapes (array, { data }, { items }, { results }, { orders })
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.orders)
          ? data.orders
          : null;

        if (list) {
          setOrders(list);
        } else if (data?.order && data?.order._id) {
          // server returned a single order object
          setOrders([data.order]);
        } else if (data?.latestOrderId || data?.orderId) {
          // fallback: server returned an id for the latest order — fetch it explicitly
          try {
            const id = data.latestOrderId || data.orderId;
            const single = await (await import('@/services/api')).orderService.getById(id);
            const resolved = single?.data || single;
            if (resolved) setOrders([resolved]);
            else setOrders([]);
          } catch (err) {
            console.debug('Failed to fetch fallback order by id', err);
            setOrders([]);
          }
        } else if (data?.success === false) {
          setError(data?.message || 'Failed to fetch provider orders');
        } else {
          // Unexpected shape: keep raw response for debugging so QA/devs can inspect easily
          console.debug('getProviderOrders returned unexpected shape', data);
          setOrders([]);
          setRawResponse(data);
        }

        // Fetch invoices for the provider and map by orderId (non-fatal)
        try {
          const invRes = await invoiceService.getMy();
          const invoices = Array.isArray(invRes) ? invRes : (Array.isArray(invRes?.data) ? invRes.data : []);
          const map: Record<string, any> = {};
          invoices.forEach((inv: any) => {
            const orderId = inv.order?._id || inv.order;
            if (orderId) map[orderId.toString()] = inv;
          });
          setInvoiceMap(map);
        } catch (err) {
          console.debug('Failed to fetch provider invoices', err);
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
          <div className="mt-6">
            <div className="text-gray-500 mb-4">No requests found.</div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchProviderOrders()}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg"
              >Refresh</button>

              <button
                onClick={() => {
                  // also attempt a low-cost fallback: try fetching recent provider orders via getMy (diagnostic)
                  (async () => {
                    try {
                      const resp = await (await import('@/services/api')).orderService.getProviderOrders();
                      console.debug('provider orders (manual):', resp);
                      setRawResponse(resp);
                    } catch (err) {
                      console.error('manual provider orders fetch failed', err);
                      setRawResponse(err?.response?.data || err);
                    }
                  })();
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
          <div className="mt-6 space-y-4">
            {orders.map((o: any) => (
              <div key={o._id} className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-semibold">Request #{o._id}</div>
                    <div className="text-xs text-gray-500">Product: {o.product?.title || o.product}</div>
                    <div className="text-xs text-gray-500">Amount: ₹{o.totalAmount}</div>
                    {(o.meta?.rentalStart && o.meta?.rentalEnd) || (o.rental?.startDate && o.rental?.endDate) ? (
                      <div className="text-xs text-gray-500">Dates: {new Date(o.meta?.rentalStart || o.rental?.startDate).toLocaleDateString()} — {new Date(o.meta?.rentalEnd || o.rental?.endDate).toLocaleDateString()}</div>
                    ) : null}
                    <div className="text-xs text-gray-500">Quantity: {o.meta?.quantity ?? o.rental?.quantity ?? (o.items?.[0]?.quantity ?? 1)}</div>
                    <div className="text-xs text-gray-400">Status: {o.status}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={`/orders/${o._id}`} className="text-blue-600">View</a>
                    {invoiceMap[o._id] && (
                      <a href={`/invoice/${invoiceMap[o._id]._id}`} className="text-sm text-blue-600 ml-2">Invoice</a>
                    )}
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

                    {o.status === 'confirmed' && (
                      <button
                        onClick={async () => {
                          if (!confirm('Mark this order as picked up?')) return;
                          try {
                            const res = await (await import('@/services/api')).orderService.markPickup(o._id);
                            if (res?.success) {
                              o.status = 'picked_up';
                              setOrders((prev) => prev.map(p => p._id === o._id ? { ...p, status: 'picked_up' } : p));
                              (await import('react-hot-toast')).toast.success('Marked as picked up');
                            } else {
                              (await import('react-hot-toast')).toast.error(res?.message || 'Failed to mark picked up');
                            }
                          } catch (err: any) {
                            console.error(err);
                            (await import('react-hot-toast')).toast.error(err?.response?.data?.message || 'Failed to mark picked up');
                          }
                        }}
                        className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg"
                      >Mark Picked Up</button>
                    )}

                    {o.status === 'picked_up' && (
                      <button
                        onClick={async () => {
                          if (!confirm('Mark this order as returned?')) return;
                          try {
                            const res = await (await import('@/services/api')).orderService.markReturn(o._id);
                            if (res?.success) {
                              o.status = 'returned';
                              setOrders((prev) => prev.map(p => p._id === o._id ? { ...p, status: 'returned' } : p));
                              (await import('react-hot-toast')).toast.success('Marked as returned');
                            } else {
                              (await import('react-hot-toast')).toast.error(res?.message || 'Failed to mark returned');
                            }
                          } catch (err: any) {
                            console.error(err);
                            (await import('react-hot-toast')).toast.error(err?.response?.data?.message || 'Failed to mark returned');
                          }
                        }}
                        className="text-sm bg-rose-600 text-white px-3 py-1 rounded-lg"
                      >Mark Returned</button>
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