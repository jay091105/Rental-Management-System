'use client';

import React from 'react';
import { useOrder } from '@/context/OrderContext';

export default function OrderSummary() {
  const { items, subtotal, deliveryCharge, total } = useOrder();

  return (
    <div className="bg-white p-4 rounded-xl border">
      <h3 className="font-bold text-lg mb-4">Order Summary</h3>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="flex justify-between items-center">
            <div>
              <div className="font-medium">{it.title}</div>
              <div className="text-xs text-gray-500">Qty: {it.quantity} · {it.rentalUnit}</div>
            </div>
            <div className="font-bold">₹{it.subtotal}</div>
          </div>
        ))}
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery</span>
            <span>₹{deliveryCharge}</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-3">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
