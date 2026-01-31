'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderSummary from '@/components/OrderSummary';
import { useOrder } from '@/context/OrderContext';

export default function CartPage() {
  const order = useOrder();
  const router = useRouter();

  return (
    <div className="container-custom py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border">
          <h1 className="text-2xl font-bold mb-4">Cart</h1>

          {order.items.length === 0 ? (
            <div className="text-gray-500">Your cart is empty. <Link href="/products" className="text-blue-600">Browse products</Link></div>
          ) : (
            <div className="space-y-4">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img src={it.image} alt={it.title} className="w-20 h-20 object-cover rounded-md" />
                  <div className="flex-1">
                    <div className="font-semibold">{it.title}</div>
                    <div className="text-sm text-gray-500">{it.rentalUnit} · Qty: {it.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{it.subtotal}</div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => order.updateItemQuantity(it.id, Math.max(1, it.quantity - 1))} className="px-3 py-1 border rounded">-</button>
                      <button onClick={() => order.updateItemQuantity(it.id, it.quantity + 1)} className="px-3 py-1 border rounded">+</button>
                      <button onClick={() => order.removeItem(it.id)} className="px-3 py-1 rounded bg-red-50 text-red-600">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Link href="/products" className="px-4 py-2 rounded border">Continue Shopping</Link>
            <button onClick={() => router.push('/checkout/address')} disabled={order.items.length === 0} className="px-4 py-2 rounded bg-blue-600 text-white">Proceed to Checkout</button>
          </div>
        </div>

        <aside>
          <OrderSummary />
        </aside>
      </div>
    </div>
  );
}
