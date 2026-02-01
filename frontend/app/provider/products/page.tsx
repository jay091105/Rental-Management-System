'use client';

import { useEffect, useState } from 'react';
import { providerService } from '@/services/api';
import Loading from '@/components/Loading';
import Link from 'next/link';
import Image from 'next/image';
import { isLikelyImageUrl, normalizeImageSrc } from '@/lib/image';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

import { Package, Plus, Edit2, Eye } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Products</h1>
            <p className="text-sm text-gray-500">Manage and track all your listed rental products.</p>
          </div>
          <Link
            href="/properties/add"
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500 font-medium">You haven't added any products yet.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p._id || p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                  {p.images && p.images.length > 0 ? (
                    (() => {
                      const raw = p.images[0];
                      const safe = isLikelyImageUrl(raw) ? (normalizeImageSrc(raw) ?? raw) : '/file.svg';
                      return <Image src={safe} alt={p.title} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="100%" />;
                    })()
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package className="w-10 h-10" />
                    </div>
                  )}
                  {!p.published && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-sm rounded-lg">Draft</span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{p.title || p.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{p.brandName || 'Unbranded'}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="text-xs font-medium text-gray-600">
                      <span className="text-gray-900 font-bold">{p.availableUnits}</span> units left
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/properties/${p._id || p.id}`} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-black transition" title="View">
                        <Eye size={16} />
                      </Link>
                      <Link href={`/properties/${p._id || p.id}/edit`} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-black transition" title="Edit">
                        <Edit2 size={16} />
                      </Link>
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