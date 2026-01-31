'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Booking } from '@/types';
import { Truck, CheckCircle, XCircle, MessageSquare, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [returnData, setReturnData] = useState({
    isDamaged: false,
    damageDescription: '',
    damageCharge: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'VENDOR') {
      router.push('/login');
      return;
    }
    fetchBookings();
  }, [user, params.id]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/orders/vendor-orders');
      // Find bookings for this order
      const orderBookings = res.data
        .flatMap((order: any) => order.bookings || [])
        .filter((b: Booking) => {
          const order = typeof b.order === 'object' ? b.order : { _id: b.order };
          return order._id === params.id;
        });
      setBookings(orderBookings);
    } catch (error: any) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      toast.success('Status updated');
      fetchBookings();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const processReturn = async (bookingId: string) => {
    try {
      await api.put(`/bookings/${bookingId}/return`, returnData);
      toast.success('Return processed');
      setSelectedBooking(null);
      fetchBookings();
    } catch (error: any) {
      toast.error('Failed to process return');
    }
  };

  const downloadInvoice = async (bookingId: string) => {
    try {
      const res = await api.get(`/bookings/${bookingId}/invoice`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded');
    } catch (error: any) {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Order</h1>

        <div className="space-y-6">
          {bookings.map((booking) => {
            const product = typeof booking.product === 'object' ? booking.product : null;
            const customer = typeof booking.user === 'object' ? booking.user : null;

            return (
              <div key={booking._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{product?.name}</h3>
                    <p className="text-gray-600">{product?.brandName}</p>
                    {customer && (
                      <p className="text-sm text-gray-600 mt-2">
                        Customer: {customer.name} ({customer.email})
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    booking.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'OUT_FOR_DELIVERY' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="font-medium">₹{booking.totalPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{booking.paymentMethod}</p>
                  </div>
                </div>

                {/* Status Update Buttons */}
                {booking.status !== 'RETURNED' && booking.status !== 'CANCELLED' && (
                  <div className="flex gap-2 mb-4">
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => updateStatus(booking._id, 'SHIPPED')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Truck size={20} />
                        Mark as Shipped
                      </button>
                    )}
                    {booking.status === 'SHIPPED' && (
                      <button
                        onClick={() => updateStatus(booking._id, 'OUT_FOR_DELIVERY')}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2"
                      >
                        <Truck size={20} />
                        Out for Delivery
                      </button>
                    )}
                    {booking.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => updateStatus(booking._id, 'DELIVERED')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <CheckCircle size={20} />
                        Mark as Delivered
                      </button>
                    )}
                    {booking.status === 'DELIVERED' && (
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                      >
                        <CheckCircle size={20} />
                        Process Return
                      </button>
                    )}
                  </div>
                )}

                {booking.status === 'RETURNED' && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600">Return Status: {booking.returnStatus}</p>
                    {booking.isDamaged && (
                      <p className="text-sm text-red-600">Product was damaged</p>
                    )}
                    {booking.damageDescription && (
                      <p className="text-sm">{booking.damageDescription}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => downloadInvoice(booking._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Download size={20} />
                    Download Invoice
                  </button>
                  <a
                    href={`/orders/${booking._id}/chat`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <MessageSquare size={20} />
                    Chat with Customer
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Return Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Process Return</h2>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={returnData.isDamaged}
                    onChange={(e) => setReturnData({ ...returnData, isDamaged: e.target.checked })}
                    className="mr-2"
                  />
                  Product is damaged
                </label>

                {returnData.isDamaged && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Damage Description</label>
                      <textarea
                        value={returnData.damageDescription}
                        onChange={(e) => setReturnData({ ...returnData, damageDescription: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Damage Charge (₹)</label>
                      <input
                        type="number"
                        value={returnData.damageCharge}
                        onChange={(e) => setReturnData({ ...returnData, damageCharge: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => processReturn(selectedBooking._id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Process Return
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(null);
                      setReturnData({ isDamaged: false, damageDescription: '', damageCharge: 0 });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
