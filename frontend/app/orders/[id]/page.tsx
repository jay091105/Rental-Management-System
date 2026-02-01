'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import { orderService } from '@/services/api';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: any = null;

    const fetchAndSubscribe = async () => {
      try {
        const res = await orderService.getById(id as string);
        const data = res?.data || res;
        setOrder(data);

        // Only create EventSource in the browser
        if (typeof window !== 'undefined' && 'EventSource' in window) {
          try {
            es = new EventSource(`/api/orders/${id}/stream`);

            es.addEventListener('order.initial', (ev: any) => {
              const payload = JSON.parse(ev.data);
              setOrder(payload.order || payload);
            });

            es.addEventListener('order.update', (ev: any) => {
              const payload = JSON.parse(ev.data);
              const updatedOrder = payload.order || payload;
              setOrder((prev: any) => ({ ...prev, ...updatedOrder }));
            });

            es.onerror = (err) => {
              console.debug('SSE error — will attempt reconnect', err);
              if (es) {
                es.close();
                es = null;
              }
              // exponential backoff could be added; keep it simple
              reconnectTimer = setTimeout(() => fetchAndSubscribe(), 3000);
            };
          } catch (err) {
            console.debug('Failed to open SSE', err);
          }
        }
      } catch (err: any) {
        console.error('Failed to load order', err);
        toast.error(err?.response?.data?.message || 'Failed to load order');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAndSubscribe();

    return () => {
      if (es) try { es.close(); } catch (e) {}
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [id, router]);

  if (loading) return <Loading />;
  if (!order) return <div className="p-8">Order not found.</div>;

  const rentalStart = order.meta?.rentalStart || order.rental?.startDate;
  const rentalEnd = order.meta?.rentalEnd || order.rental?.endDate;
  const qty = order.meta?.quantity ?? order.rental?.quantity ?? order.items?.[0]?.quantity ?? 1;

  // Prefer server-provided timeline, otherwise infer from timestamps
  const timeline = Array.isArray(order.timeline) && order.timeline.length > 0
    ? order.timeline
    : [
        { key: 'requested', label: 'Requested', at: order.createdAt },
        order.status && order.updatedAt ? { key: order.status, label: order.status.charAt(0).toUpperCase() + order.status.slice(1), at: order.updatedAt } : null
      ].filter(Boolean as any) as Array<{ key: string; label: string; at?: string | Date | null }>;

  return (
    <ProtectedRoute allowedRoles={["provider", "admin", "renter"]}>
      <div className="p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold">Order #{order._id}</h1>
            <p className="text-gray-600 mt-1">{order.product?.title || order.product}</p>
            <p className="text-sm text-gray-500 mt-2">Amount: ₹{order.totalAmount}</p>
            <p className="text-sm text-gray-400 mt-1">Status: {order.status}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await orderService.getById(order._id);
                    const data = res?.data || res;
                    setOrder(data);
                    toast.success('Refreshed');
                  } catch (err: any) {
                    console.error(err);
                    toast.error(err?.response?.data?.message || 'Failed to refresh');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-gray-100 text-sm px-3 py-2 rounded"
              >Refresh</button>

              {order.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    disabled={actionLoading}
                    onClick={async () => {
                      if (!confirm('Approve this order?')) return;
                      setActionLoading(true);
                      try {
                        const res = await orderService.updateStatus(order._id, 'confirmed');
                        if (res?.success) {
                          // merge returned data with timeline if present
                          const updated = res.data || res;
                          setOrder((prev: any) => ({ ...prev, ...updated, status: 'confirmed' }));
                          toast.success('Order approved');
                        } else {
                          toast.error(res?.message || 'Failed to approve');
                        }
                      } catch (err: any) {
                        console.error(err);
                        toast.error(err?.response?.data?.message || 'Failed to approve');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  >Approve</button>

                  <button
                    disabled={actionLoading}
                    onClick={async () => {
                      if (!confirm('Reject this order?')) return;
                      setActionLoading(true);
                      try {
                        const res = await orderService.updateStatus(order._id, 'cancelled');
                        if (res?.success) {
                          const updated = res.data || res;
                          setOrder((prev: any) => ({ ...prev, ...updated, status: 'cancelled' }));
                          toast.success('Order rejected');
                        } else {
                          toast.error(res?.message || 'Failed to reject');
                        }
                      } catch (err: any) {
                        console.error(err);
                        toast.error(err?.response?.data?.message || 'Failed to reject');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg"
                  >Reject</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border col-span-2">
            <h3 className="font-bold text-lg mb-4">Tracking</h3>

            <div className="space-y-4">
              {timeline.map((t: any) => (
                <div key={t.key} className="flex items-start gap-4">
                  <div className={`mt-1 w-3 h-3 rounded-full ${t.key === 'requested' ? 'bg-gray-400' : t.key === 'confirmed' ? 'bg-emerald-500' : t.key === 'completed' ? 'bg-blue-600' : 'bg-yellow-500'}`} />
                  <div>
                    <div className="font-semibold">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.at ? new Date(t.at).toLocaleString() : '—'}</div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t mt-4">
                <h4 className="font-semibold mb-2">Rental details</h4>
                {rentalStart && rentalEnd ? (
                  <div className="text-sm text-gray-700">
                    <div>Dates: {new Date(rentalStart).toLocaleDateString()} — {new Date(rentalEnd).toLocaleDateString()}</div>
                    <div className="mt-2">Quantity: {qty}</div>
                    <div className="mt-2">Renter: {order.renter?.name || order.renter?.email || order.renter}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No rental metadata attached to this order.</div>
                )}

                <div className="mt-6">
                  <h4 className="font-semibold">Notes</h4>
                  <p className="text-sm text-gray-600 mt-2">{order.notes || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="bg-white p-6 rounded-xl border">
            <h4 className="font-bold mb-3">Product</h4>
            <div className="text-sm text-gray-700">{order.product?.title || order.product}</div>
            <div className="mt-4 text-sm text-gray-500">Contact: {order.renter?.email || '—'}</div>
            <div className="mt-6">
              <a href={`/orders/${order._id}`} className="text-blue-600">Open in app</a>
            </div>
          </aside>
        </div>
      </div>
    </ProtectedRoute>
  );
}
