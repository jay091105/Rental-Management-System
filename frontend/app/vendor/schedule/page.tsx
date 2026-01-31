'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Booking, Product } from '@/types';
import { Calendar, Package, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO, isWithinInterval } from 'date-fns';

export default function SchedulePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'VENDOR') {
      router.push('/login');
      return;
    }
    fetchGanttData();
  }, [user]);

  const fetchGanttData = async () => {
    try {
      const res = await api.get('/bookings/gantt');
      setBookings(res.data);
    } catch (error: any) {
      toast.error('Failed to fetch schedule data');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getDaysArray = () => {
    const today = new Date();
    const days: Date[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getBookingForProductAndDate = (productId: string, date: Date) => {
    return bookings.find(booking => {
      const product = typeof booking.product === 'object' ? booking.product : null;
      if (!product || product._id !== productId) return false;
      
      const start = parseISO(booking.startDate);
      const end = parseISO(booking.endDate);
      return isWithinInterval(date, { start, end });
    });
  };

  const getProducts = () => {
    const productMap = new Map<string, Product>();
    bookings.forEach(booking => {
      const product = typeof booking.product === 'object' ? booking.product : null;
      if (product) {
        productMap.set(product._id, product);
      }
    });
    return Array.from(productMap.values());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const days = getDaysArray();
  const products = getProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Schedule (Gantt Chart)</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">No bookings scheduled</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <div className="min-w-full">
              {/* Header */}
              <div className="flex border-b sticky top-0 bg-white z-10">
                <div className="w-64 p-4 font-bold border-r">Product</div>
                <div className="flex-1 flex">
                  {days.map((day, idx) => (
                    <div
                      key={idx}
                      className="flex-1 p-2 text-center border-r text-xs"
                      style={{ minWidth: '60px' }}
                    >
                      <div className="font-bold">{format(day, 'MMM')}</div>
                      <div>{format(day, 'dd')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              {products.map((product) => (
                <div key={product._id} className="flex border-b hover:bg-gray-50">
                  <div className="w-64 p-4 border-r">
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.brandName}</div>
                    <div className="text-xs text-gray-500">{product.availableUnits} available</div>
                  </div>
                  <div className="flex-1 flex relative">
                    {days.map((day, idx) => {
                      const booking = getBookingForProductAndDate(product._id, day);
                      const isStart = booking && format(parseISO(booking.startDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                      const isEnd = booking && format(parseISO(booking.endDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                      
                      return (
                        <div
                          key={idx}
                          className="flex-1 border-r relative"
                          style={{ minWidth: '60px' }}
                          onClick={() => booking && setSelectedBooking(booking)}
                        >
                          {booking && (
                            <div
                              className={`absolute inset-0 ${
                                booking.status === 'DELIVERED' ? 'bg-green-500' :
                                booking.status === 'SHIPPED' ? 'bg-blue-500' :
                                booking.status === 'OUT_FOR_DELIVERY' ? 'bg-yellow-500' :
                                'bg-purple-500'
                              } opacity-70 hover:opacity-100 cursor-pointer transition`}
                              title={`${booking.status} - Click for details`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {(() => {
                const product = typeof selectedBooking.product === 'object' ? selectedBooking.product : null;
                const customer = typeof selectedBooking.user === 'object' ? selectedBooking.user : null;
                
                return (
                  <div className="space-y-4">
                    {product && (
                      <div>
                        <h3 className="font-bold mb-2">Product:</h3>
                        <p>{product.name} - {product.brandName}</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                    )}

                    {customer && (
                      <div>
                        <h3 className="font-bold mb-2">Customer:</h3>
                        <p>{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold mb-2">Rental Period:</h3>
                      <p>{format(parseISO(selectedBooking.startDate), 'PPp')}</p>
                      <p>to {format(parseISO(selectedBooking.endDate), 'PPp')}</p>
                    </div>

                    <div>
                      <h3 className="font-bold mb-2">Status:</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        selectedBooking.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        selectedBooking.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                        selectedBooking.status === 'OUT_FOR_DELIVERY' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedBooking.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold mb-2">Total Price:</h3>
                      <p className="text-xl">₹{selectedBooking.totalPrice}</p>
                    </div>

                    {selectedBooking.trackingUpdates && selectedBooking.trackingUpdates.length > 0 && (
                      <div>
                        <h3 className="font-bold mb-2">Tracking Updates:</h3>
                        <div className="space-y-2">
                          {selectedBooking.trackingUpdates.map((update, idx) => (
                            <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                              <p className="font-medium">{update.status}</p>
                              <p className="text-gray-600">{update.message || ''}</p>
                              <p className="text-xs text-gray-500">
                                {format(parseISO(update.timestamp), 'PPp')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
