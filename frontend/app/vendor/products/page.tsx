'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'VENDOR') {
      router.push('/login');
      return;
    }
    fetchVendorProducts();
  }, [user]);

  const fetchVendorProducts = async () => {
    try {
      const { data } = await api.get('/products/vendor');
      setProducts(data);
    } catch (error: any) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchVendorProducts();
    } catch (error: any) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <Link
            href="/vendor/products/new"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2 shadow-lg"
          >
            <Plus size={20} />
            Add New Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No products yet</h2>
            <p className="text-gray-600 mb-6">Add your first product to get started</p>
            <Link
              href="/vendor/products/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all">
                {product.photos && product.photos.length > 0 ? (
                  <img
                    src={`http://localhost:5000${product.photos[0]}`}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Package className="text-gray-400" size={48} />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.brandName} • {product.category}</p>
                  {product.colour && (
                    <p className="text-gray-500 text-sm mb-2">Color: {product.colour}</p>
                  )}
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-xl font-bold text-blue-600">₹{product.pricePerDay}</p>
                      <p className="text-xs text-gray-500">per day</p>
                    </div>
                    <p className={`text-sm font-medium ${
                      product.availableUnits > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.availableUnits} available
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                    <Link
                      href={`/products/${product._id}`}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-center"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
