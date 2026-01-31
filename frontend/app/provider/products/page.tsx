'use client';

import { useEffect, useState } from 'react';
import { providerService } from '@/services/api';
import Loading from '@/components/Loading';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProviderProductsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await providerService.getProducts();
        setProducts(data || []);
      } catch (err) {
        console.error('Failed to load provider products', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <Loading />;

  return (
    <ProtectedRoute allowedRoles={["provider", "admin"]}>
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Products</h1>
          <Link href="/properties/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Add New</Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500">You haven't added any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p._id || p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="relative aspect-[4/3] bg-gray-100">
                  {p.images && p.images.length > 0 ? (
                    <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="100%" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                      <span className="text-sm font-medium">No Image</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900">{p.title || p.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{p.brandName}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">{p.availableUnits} units</div>
                    <div className="flex items-center gap-2">
                      {!p.published && (
                        <span className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded">Unpublished</span>
                      )}
                      <Link href={`/properties/${p._id || p.id}/edit`} className="text-sm text-blue-600">Edit</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}