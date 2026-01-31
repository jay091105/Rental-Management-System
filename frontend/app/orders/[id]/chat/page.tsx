'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Message, Booking } from '@/types';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const params = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchBooking();
    
    // Poll for new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${params.id}`);
      setMessages(res.data);
    } catch (error) {
      // Ignore errors
    }
  };

  const fetchBooking = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      const allBookings = res.data.flatMap((order: any) => order.bookings || []);
      const found = allBookings.find((b: Booking) => b._id === params.id);
      if (found) {
        setBooking(found);
      }
    } catch (error) {
      // Ignore errors
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !booking) return;

    try {
      const product = typeof booking.product === 'object' ? booking.product : null;
      const vendor = typeof booking.vendor === 'object' ? booking.vendor : null;
      const customer = typeof booking.user === 'object' ? booking.user : null;
      
      const receiverId = user?.role === 'VENDOR' ? customer?._id : vendor?._id;
      
      await api.post('/chat', {
        bookingId: params.id,
        receiverId,
        content: newMessage
      });
      
      setNewMessage('');
      fetchMessages();
    } catch (error: any) {
      toast.error('Failed to send message');
    }
  };

  const product = booking && typeof booking.product === 'object' ? booking.product : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: '80vh' }}>
          {/* Header */}
          <div className="bg-blue-600 text-white p-4">
            <h1 className="text-xl font-bold">Chat</h1>
            {product && (
              <p className="text-sm opacity-90">{product.name} - {product.brandName}</p>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const sender = typeof message.sender === 'object' ? message.sender : null;
              const isOwn = sender?._id === user?.id;
              
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">{sender?.name || 'Unknown'}</p>
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Send size={20} />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
