'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import { useAuth } from '@/context/AuthContext';

export default function EditProductPage() {
  const { user } = useAuth();
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const product = await productService.getById(id);
        // Map product shape to form shape used by Add/Edit pages
        setFormData({
          title: product.title || product.name || '',
          description: product.description || '',
          location: product.location || '',
          price: product.price || 0,
          pricePerHour: product.pricePerHour || 0,
          pricePerDay: product.pricePerDay || 0,
          pricePerMonth: product.pricePerMonth || 0,
          availableUnits: product.availableUnits ?? 1,
          deliveryCharges: product.deliveryCharges || 0,
          deposit: product.deposit || 0,
          brandName: product.brandName || '',
          colour: product.colour || '',
          imageURL: product.images && product.images.length ? product.images[0] : '',
          photosCSV: product.images && product.images.length ? product.images.slice(1).join(', ') : '',
          category: product.category || 'Other',
          published: !!product.published,
        });
      } catch (err) {
        console.error('Failed to load product for editing', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, type, value, checked } = target;
    const numericFields = new Set(['price', 'pricePerHour', 'pricePerDay', 'pricePerMonth', 'availableUnits', 'deposit', 'deliveryCharges']);

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (numericFields.has(name)) {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const images = formData.photosCSV
        ? formData.photosCSV.split(',').map((i: string) => i.trim()).filter(Boolean)
        : formData.imageURL ? [formData.imageURL] : [];

      const dataToSubmit = {
        ...formData,
        images,
      };

      await productService.update(id, dataToSubmit);
      router.push(`/properties/${id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (!formData) return <div className="p-8">Product not found</div>;

  return (
    <ProtectedRoute allowedRoles={["admin", "provider"]}>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

        {error && (
          <div className="mb-4 p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Real Estate">Real Estate</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Equipment & Tools">Equipment & Tools</option>
              <option value="Electronics">Electronics</option>
              <option value="Events & Party">Events & Party</option>
              <option value="Furniture">Furniture</option>
              <option value="Fashion">Fashion</option>
              <option value="Sports & Outdoors">Sports & Outdoors</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              name="imageURL"
              value={formData.imageURL}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Image URLs (comma separated)</label>
            <input
              type="text"
              name="photosCSV"
              value={formData.photosCSV}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://a.jpg, https://b.jpg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rent Amount ($/hour)</label>
              <input
                type="number"
                name="pricePerHour"
                min="0"
                value={formData.pricePerHour}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rent Amount ($/day)</label>
              <input
                type="number"
                name="pricePerDay"
                min="0"
                value={formData.pricePerDay}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rent Amount ($/month)</label>
              <input
                type="number"
                name="pricePerMonth"
                min="0"
                value={formData.pricePerMonth}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Units</label>
              <input
                type="number"
                name="availableUnits"
                min="0"
                value={formData.availableUnits}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit</label>
              <input
                type="number"
                name="deposit"
                min="0"
                value={formData.deposit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charges</label>
              <input
                type="number"
                name="deliveryCharges"
                min="0"
                value={formData.deliveryCharges}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="flex items-center gap-4 mt-4">
              <label className="text-sm font-medium text-gray-700">Publish product</label>
              <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
              <input
                type="text"
                name="colour"
                value={formData.colour}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Updating Product...' : 'Update Product'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}