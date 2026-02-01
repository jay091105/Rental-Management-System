'use client';

import Link from 'next/link';
import { PRODUCTS } from '@/lib/mockProducts';

export default function ProductsPage() {
  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRODUCTS.map((p: { id: string; title: string; images?: string[]; basePrice?: number; rentalUnit?: string }) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-shadow transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
          >
            <Link href={`/products/${p.id}`} className="block">
              <div className="relative h-56 bg-gray-50 overflow-hidden flex items-center justify-center">
                <img
                  src={p.images?.[0]}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />

                {/* badge */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${p.basePrice && p.basePrice > 100 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="opacity-80">
                      <circle cx="4" cy="4" r="4" />
                    </svg>
                    {p.basePrice && p.basePrice > 100 ? 'Premium' : 'In stock'}
                  </span>
                </div>

                {/* price pill */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm text-sm font-bold">
                  ₹{p.basePrice?.toLocaleString()} <span className="text-gray-400 font-medium">/ {p.rentalUnit}</span>
                </div>

                {/* details button */}
                <div className="absolute bottom-4 right-4">
                  <div className="bg-white/95 rounded-full px-3 py-1.5 border border-gray-100 shadow-sm text-sm font-medium text-blue-600">
                    Details
                  </div>
                </div>
              </div>

              <div className="p-4 pb-5">
                <h3 className="font-semibold text-lg text-gray-900 truncate">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">Reliable equipment — well maintained and insured.</p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">From</div>
                    <div className="text-base font-extrabold text-gray-900">₹{p.basePrice}</div>
                    <div className="text-sm text-gray-400">/ {p.rentalUnit}</div>
                  </div>

                  <div className="text-sm text-gray-400">· 4.8 ★</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
