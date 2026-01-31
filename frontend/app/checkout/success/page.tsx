'use client';

import { useEffect } from 'react';
import { useOrder } from '@/context/OrderContext';
import Link from 'next/link';

export default function SuccessPage() {
  const order = useOrder();

  useEffect(() => {
    // clear cart after a short delay so invoice can still be viewed via order id
    const t = setTimeout(() => {
      // keep created order in history but clear cart
      order.clearOrder();
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="container-custom py-12">
      <div className="bg-white p-8 rounded-2xl border text-center">
        <h1 className="text-3xl font-bold mb-4">Thank you! 🎉</h1>
        <p className="text-gray-600 mb-4">Your payment was successful.</p>
        <div className="mb-4">
          <div className="font-semibold">Order ID</div>
          <div className="text-blue-600 text-xl">{order.orderId}</div>
        </div>
        <div className="flex gap-4 justify-center">
          <Link href={`/invoice/${order.orderId}`} className="px-4 py-2 rounded bg-blue-600 text-white">Print Invoice</Link>
          <Link href="/products" className="px-4 py-2 rounded border">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
