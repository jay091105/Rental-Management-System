'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { orderService, invoiceService } from '@/services/api';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { Package, Calendar, Clock, ArrowRight, Check, X, Truck, RotateCcw, FileText } from 'lucide-react';

export default function ProviderOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [invoiceMap, setInvoiceMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const fetchProviderOrders = async () => {
    try {
      const data = await orderService.getProviderOrders();
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
        setOrders([data.order]);
      } else if (data?.latestOrderId || data?.orderId) {
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
        setOrders([]);
        setRawResponse(data);
      }

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

  useEffect(() => {
    fetchProviderOrders();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'confirmed': return 'bg-blue-50 text-blue-700';
      case 'picked_up':
      case 'picked up': return 'bg-purple-50 text-purple-700';
      case 'returned': return 'bg-green-50 text-green-700';
      case 'late': return 'bg-red-50 text-red-700';
      case 'pending': return 'bg-yellow-50 text-yellow-700';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <ProtectedRoute allowedRoles={["provider", "admin"]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Incoming Requests</h1>
          <p className="text-sm text-gray-500">Manage rental requests and track active orders for your products.</p>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-red-700 text-sm">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500 mb-6 font-medium">No requests found.</div>
            <button onClick={() => fetchProviderOrders()} className="bg-black text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition">
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((o: any) => (
              <div key={o._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white transition-colors">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold text-gray-900">Request #{o._id?.slice(-8).toUpperCase()}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(o.status)}`}>
                          {o.status || 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">{o.product?.title || o.product}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>₹{o.totalAmount?.toLocaleString()}</span>
                        </div>
                        {(o.meta?.rentalStart || o.rental?.startDate) && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(o.meta?.rentalStart || o.rental?.startDate).toLocaleDateString()} — {new Date(o.meta?.rentalEnd || o.rental?.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">Qty: {o.meta?.quantity ?? o.rental?.quantity ?? 1}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                    <Link href={`/orders/${o._id}`} className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition" title="View Details">
                      <ArrowRight size={18} />
                    </Link>
                    
                    {invoiceMap[o._id] && (
                      <Link href={`/invoice/${invoiceMap[o._id]._id}`} className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition" title="View Invoice">
                        <FileText size={18} />
                      </Link>
                    )}

                    {o.status === 'pending' && (
                      <>
                        <button
                          onClick={async () => {
                            if (!confirm('Approve this request?')) return;
                            try {
                              const res = await (await import('@/services/api')).orderService.updateStatus(o._id, 'confirmed');
                              if (res?.success) {
                                setOrders((prev) => prev.map(p => p._id === o._id ? { ...p, status: 'confirmed' } : p));
                                (await import('react-hot-toast')).toast.success('Request approved');
                              }
                            } catch (err: any) {
                              (await import('react-hot-toast')).toast.error('Failed to approve');
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition"
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Reject this request?')) return;
                            try {
                              const res = await (await import('@/services/api')).orderService.updateStatus(o._id, 'cancelled');
                              if (res?.success) {
                                setOrders((prev) => prev.map(p => p._id === o._id ? { ...p, status: 'cancelled' } : p));
                                (await import('react-hot-toast')).toast.success('Request rejected');
                              }
                            } catch (err: any) {
                              (await import('react-hot-toast')).toast.error('Failed to reject');
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition"
                        >
                          <X size={16} /> Reject
                        </button>
                      </>
                    )}

                    {o.status === 'confirmed' && (
                      <button
                        onClick={async () => {
                          if (!confirm('Mark as picked up?')) return;
                          try {
                            const res = await (await import('@/services/api')).orderService.markPickup(o._id);
                            if (res?.success) {
                              setOrders((prev) => prev.map(p => p._id === o._id ? { ...p, status: 'picked_up' } : p));
                              (await import('react-hot-toast')).toast.success('Marked as picked up');
                            }
                          } catch (err: any) {
                            (await import('react-hot-toast')).toast.error('Failed to mark pickup');
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition"
                      >
                        <Truck size={16} /> Mark Picked Up
                      </button>
                    )}

                    {o.status === 'picked_up' && (
                      <button
                        onClick={async () => {
                          if (!confirm('Mark as returned?')) return;
                          try {
                            const res = await (await import('@/services/api')).orderService.markReturn(o._id);
                            if (res?.success) {
                              setOrders((prev) => prev.map(p => p._id === o._id ? { ...p, status: 'returned' } : p));
                              (await import('react-hot-toast')).toast.success('Marked as returned');
                            }
                          } catch (err: any) {
                            (await import('react-hot-toast')).toast.error('Failed to mark return');
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition"
                      >
                        <RotateCcw size={16} /> Mark Returned
                      </button>
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