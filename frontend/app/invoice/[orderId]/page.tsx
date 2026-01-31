'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InvoicePage() {
  const params = useParams();
  const orderId = params.orderId;
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('orders_history');
      const list = raw ? JSON.parse(raw) : [];
      const found = list.find((o: any) => o.orderId === orderId);
      setOrder(found || null);
    } catch (e) {
      setOrder(null);
    }
  }, [orderId]);

  if (!order) return <div className="p-8">Invoice not found</div>;

  const handlePrint = () => window.print();

  return (
    <div className="container-custom py-8">
      <div className="bg-white p-6 rounded-xl border max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Rentify</h2>
            <div className="text-sm text-gray-500">Invoice</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">Order #{order.orderId}</div>
            <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="font-semibold">Customer</div>
            <div className="text-sm">{order.deliveryAddress?.name}</div>
            <div className="text-sm text-gray-500">{order.deliveryAddress?.line1}</div>
            <div className="text-sm text-gray-500">{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.postalCode}</div>
          </div>
          <div>
            <div className="font-semibold">Billing</div>
            <div className="text-sm">{order.billingAddress?.name}</div>
            <div className="text-sm text-gray-500">{order.billingAddress?.line1}</div>
          </div>
        </div>

        <table className="w-full text-left text-sm mb-6">
          <thead>
            <tr className="text-gray-500">
              <th>Product</th>
              <th>Qty</th>
              <th>Unit</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it: any) => (
              <tr key={it.id} className="border-t">
                <td className="py-3">{it.title}</td>
                <td className="py-3">{it.quantity}</td>
                <td className="py-3">{it.rentalUnit}</td>
                <td className="py-3 text-right">₹{it.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end gap-6 items-center">
          <div className="text-gray-600">Delivery</div>
          <div className="font-bold">₹{order.deliveryCharge}</div>
        </div>
        <div className="flex justify-end gap-6 items-center mt-2">
          <div className="text-lg font-semibold">Total</div>
          <div className="text-2xl font-extrabold text-blue-600">₹{order.items.reduce((s:any, i:any) => s + i.subtotal, 0) + (order.deliveryCharge||0)}</div>
        </div>

        <div className="mt-6 flex justify-between">
          <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded">Print Invoice</button>
        </div>
      </div>
    </div>
  );
}
