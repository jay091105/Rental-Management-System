'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderSummary from '@/components/OrderSummary';
import { useOrder } from '@/context/OrderContext';

export default function PaymentPage() {
  const order = useOrder();
  const router = useRouter();
  const [card, setCard] = useState({ number: '', exp: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!card.number || !card.exp || !card.cvv) {
      setError('Please fill card details');
      return;
    }
    setLoading(true);
    try {
      // Simulate payment
      await new Promise((r) => setTimeout(r, 800));
      const res = await order.createOrder();
      if (res.success) {
        router.push('/checkout/success');
      } else {
        setError('Payment failed');
      }
    } catch (err) {
      setError('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border">
        <h1 className="text-2xl font-bold mb-4">Payment</h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm">Card Number</label>
            <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} className="w-full p-2 border rounded" placeholder="4242 4242 4242 4242" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Expiry</label>
              <input value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} className="w-full p-2 border rounded" placeholder="MM/YY" />
            </div>
            <div>
              <label className="text-sm">CVV</label>
              <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} className="w-full p-2 border rounded" placeholder="123" />
            </div>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <div className="mt-6 flex justify-between">
            <button className="px-4 py-2 rounded border" onClick={() => router.push('/checkout/address')}>Back</button>
            <button onClick={handlePay} className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Processing...' : 'Pay Now'}</button>
          </div>
        </div>
      </div>

      <aside>
        <OrderSummary />
      </aside>
    </div>
  );
}
