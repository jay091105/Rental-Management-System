'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderSummary from '@/components/OrderSummary';
import { useOrder } from '@/context/OrderContext';

export default function AddressPage() {
  const order = useOrder();
  const router = useRouter();

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery'|'pickup'>(order.deliveryMethod || 'delivery');
  const [copyBilling, setCopyBilling] = useState(false);
  const [delivery, setDelivery] = useState(order.deliveryAddress || {
    name: '', line1: '', city: '', state: '', postalCode: '', country: ''
  });
  const [billing, setBilling] = useState(order.billingAddress || delivery);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (deliveryMethod === 'delivery') {
      if (!delivery.name || !delivery.line1 || !delivery.city) {
        setError('Please fill delivery address');
        return;
      }
      order.setDeliveryAddress(delivery);
    }
    order.setDeliveryMethod(deliveryMethod);
    if (copyBilling) order.setBillingAddress(delivery);
    else order.setBillingAddress(billing);
    router.push('/checkout/payment');
  };

  return (
    <div className="container-custom py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border">
        <h1 className="text-2xl font-bold mb-4">Delivery & Address</h1>

        <div className="mb-4">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="dm" checked={deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} />
            <span className="ml-2">Standard Delivery</span>
          </label>
          <label className="inline-flex items-center gap-2 ml-6">
            <input type="radio" name="dm" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} />
            <span className="ml-2">Store Pickup</span>
          </label>
        </div>

        {deliveryMethod === 'delivery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Name</label>
              <input className="w-full p-2 border rounded" value={delivery.name} onChange={(e) => setDelivery({ ...delivery, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Phone</label>
              <input className="w-full p-2 border rounded" value={delivery.phone || ''} onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Address</label>
              <input className="w-full p-2 border rounded" value={delivery.line1} onChange={(e) => setDelivery({ ...delivery, line1: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">City</label>
              <input className="w-full p-2 border rounded" value={delivery.city} onChange={(e) => setDelivery({ ...delivery, city: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">State</label>
              <input className="w-full p-2 border rounded" value={delivery.state} onChange={(e) => setDelivery({ ...delivery, state: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Postal Code</label>
              <input className="w-full p-2 border rounded" value={delivery.postalCode} onChange={(e) => setDelivery({ ...delivery, postalCode: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Country</label>
              <input className="w-full p-2 border rounded" value={delivery.country} onChange={(e) => setDelivery({ ...delivery, country: e.target.value })} />
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={copyBilling} onChange={(e) => { setCopyBilling(e.target.checked); if (e.target.checked) setBilling(delivery); }} />
            <span className="ml-2">Billing address same as delivery</span>
          </label>
        </div>

        {!copyBilling && (
          <div className="mt-4">
            <h3 className="font-semibold">Billing Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="text-sm">Name</label>
                <input className="w-full p-2 border rounded" value={billing.name} onChange={(e) => setBilling({ ...billing, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Phone</label>
                <input className="w-full p-2 border rounded" value={billing.phone || ''} onChange={(e) => setBilling({ ...billing, phone: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm">Address</label>
                <input className="w-full p-2 border rounded" value={billing.line1} onChange={(e) => setBilling({ ...billing, line1: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">City</label>
                <input className="w-full p-2 border rounded" value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">State</label>
                <input className="w-full p-2 border rounded" value={billing.state} onChange={(e) => setBilling({ ...billing, state: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Postal Code</label>
                <input className="w-full p-2 border rounded" value={billing.postalCode} onChange={(e) => setBilling({ ...billing, postalCode: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {error && <div className="text-red-600 mt-4">{error}</div>}

        <div className="mt-6 flex justify-between">
          <button className="px-4 py-2 rounded border" onClick={() => router.push('/cart')}>Back to Cart</button>
          <button onClick={handleContinue} className="px-4 py-2 rounded bg-blue-600 text-white">Continue to Payment</button>
        </div>
      </div>

      <aside>
        <OrderSummary />
      </aside>
    </div>
  );
}
