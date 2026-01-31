'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Product } from '@/types';
import { Plus, Package, BarChart3, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function VendorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'VENDOR') {
      router.push('/login');
      return;
    }
    fetchProducts();
    fetchStats();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/vendor');
      setProducts(res.data);
    } catch (error: any) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/bookings/reports');
      setStats({
        totalProducts: products.length,
        totalOrders: res.data.totalBookings || 0,
        totalRevenue: res.data.totalRevenue || 0
      });
    } catch (error) {
      // Ignore errors
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <Link
            href="/vendor/products/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <Package className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <BarChart3 className="text-green-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
              </div>
              <BarChart3 className="text-purple-600" size={40} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/vendor/products"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center"
          >
            <Package className="mx-auto text-blue-600 mb-2" size={32} />
            <p className="font-semibold">Manage Products</p>
          </Link>

          <Link
            href="/orders"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center"
          >
            <BarChart3 className="mx-auto text-green-600 mb-2" size={32} />
            <p className="font-semibold">View Orders</p>
          </Link>

          <Link
            href="/vendor/reports"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center"
          >
            <BarChart3 className="mx-auto text-purple-600 mb-2" size={32} />
            <p className="font-semibold">Reports</p>
          </Link>

          <Link
            href="/vendor/schedule"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-center"
          >
            <Calendar className="mx-auto text-orange-600 mb-2" size={32} />
            <p className="font-semibold">Schedule</p>
          </Link>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Products</h2>
            <Link href="/vendor/products" className="text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>
          {products.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No products yet. Add your first product!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.slice(0, 3).map((product) => (
                <div key={product._id} className="border rounded-lg p-4">
                  {product.photos && product.photos.length > 0 && (
                    <img
                      src={`http://localhost:5000${product.photos[0]}`}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.brandName}</p>
                  <p className="text-sm text-gray-600">
                    {product.availableUnits} available
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
