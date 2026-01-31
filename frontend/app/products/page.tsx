'use client';

import Link from 'next/link';
import { PRODUCTS } from '@/lib/mockProducts';

export default function ProductsPage() {
  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRODUCTS.map((p: { id: string; title: string; images?: string[]; basePrice?: number; rentalUnit?: string }) => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Link href={`/products/${p.id}`} className="block">
              <div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                <img src={p.images?.[0]} alt={p.title} className="h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg">{p.title}</h3>
                <div className="text-sm text-gray-500">₹{p.basePrice}/{p.rentalUnit}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
