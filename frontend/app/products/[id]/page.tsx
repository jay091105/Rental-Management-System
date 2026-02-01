'use client';

import Image from 'next/image';
import ConfigureModal from '@/components/ConfigureModal';
import { PRODUCTS } from '@/lib/mockProducts';
import { useState } from 'react';

export default function ProductPage({ params }: { params: { id: string } }) {
  const p = PRODUCTS.find((x) => x.id === params.id);
  const [open, setOpen] = useState(false);

  if (!p) {
    return (
      <div className="container-custom py-8">
        <div className="text-center text-gray-500">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-3xl overflow-hidden border border-gray-100 mb-6">
            <Image src={p.images?.[0] ?? '/images/placeholder.png'} alt={p.title} width={1200} height={700} className="w-full h-80 object-cover" />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h1 className="text-2xl font-bold">{p.title}</h1>
            <p className="mt-3 text-gray-500">Reliable equipment — well maintained and insured.</p>

            <div className="mt-6">
              <h3 className="font-semibold">Configure</h3>
              <button className="mt-3 rounded bg-blue-600 px-4 py-2 text-white" onClick={() => setOpen(true)}>Configure</button>

              <ConfigureModal
                open={open}
                onClose={() => setOpen(false)}
                title={p.title}
                basePrice={p.basePrice}
                variants={p.variants}
                onConfirm={() => setOpen(false)}
              />
            </div>
          </div>
        </div>

        <aside className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-fit">
          <div className="text-sm text-gray-500">From</div>
          <div className="text-2xl font-extrabold">₹{p.basePrice}</div>
          <div className="mt-4">· 4.8 ★</div>

          <div className="mt-6 border-t pt-6">
            <button className="w-full bg-amber-500 text-white rounded-lg py-3">Rent this item</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
