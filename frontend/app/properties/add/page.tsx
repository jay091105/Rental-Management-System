'use client';

import { useState } from 'react';
import { productService } from '@/services/api';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function AddProductPage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: 0,
    pricePerHour: 0,
    pricePerDay: 0,
    pricePerMonth: 0,
    availableUnits: 1,
    deliveryCharges: 0,
    deposit: 0,
    brandName: '',
    colour: '',
    imageURL: '',
    photosCSV: '' /* comma-separated image URLs */,
    category: 'Other',
    published: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Basic client validation: required fields and at least one pricing field
      if (!formData.title || !formData.description || !formData.location) {
        setError('Please fill title, description and location');
        setIsSubmitting(false);
        return;
      }

      if (!formData.price && !formData.pricePerDay && !formData.pricePerHour && !formData.pricePerMonth) {
        setError('Please set at least one pricing field (pricePerHour/pricePerDay/pricePerMonth/price)');
        setIsSubmitting(false);
        return;
      }

      const images = formData.photosCSV
        ? formData.photosCSV.split(',').map(i => i.trim()).filter(Boolean)
        : formData.imageURL ? [formData.imageURL] : [];

      const dataToSubmit = {
        ...formData,
        images,
      };

      const created = await productService.create(dataToSubmit);
      // If provider added the product, take them to provider dashboard so they immediately see their new item
      if (user?.role === 'provider') {
        router.push('/provider/products');
      } else {
        router.push(`/properties/${created._id || created.id}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <ProtectedRoute allowedRoles={['admin', 'provider']}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add New Product</h1>
          <p className="text-gray-500">List your item for rent and start earning.</p>
        </div>
        
        {error && (
          <div className="mb-8 p-4 text-red-600 bg-red-50 border border-red-100 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                  placeholder="e.g. Professional DSLR Camera"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                  placeholder="Describe your product in detail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition bg-white"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    placeholder="e.g. Mumbai, Maharashtra"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Pricing & Inventory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rent (₹/hour)</label>
                <input
                  type="number"
                  name="pricePerHour"
                  min="0"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rent (₹/day)</label>
                <input
                  type="number"
                  name="pricePerDay"
                  min="0"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rent (₹/month)</label>
                <input
                  type="number"
                  name="pricePerMonth"
                  min="0"
                  value={formData.pricePerMonth}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Available Units</label>
                <input
                  type="number"
                  name="availableUnits"
                  min="0"
                  value={formData.availableUnits}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Security Deposit (₹)</label>
                <input
                  type="number"
                  name="deposit"
                  min="0"
                  value={formData.deposit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Fee (₹)</label>
                <input
                  type="number"
                  name="deliveryCharges"
                  min="0"
                  value={formData.deliveryCharges}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Media & Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Main Image URL</label>
                <input
                  type="url"
                  name="imageURL"
                  value={formData.imageURL}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Other Image URLs (comma separated)</label>
                <input
                  type="text"
                  name="photosCSV"
                  value={formData.photosCSV}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                  placeholder="https://a.jpg, https://b.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Name</label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    placeholder="e.g. Sony"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Colour</label>
                  <input
                    type="text"
                    name="colour"
                    value={formData.colour}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    placeholder="e.g. Black"
                  />
                </div>
              </div>
            </div>
          </section>

          {user?.role === 'admin' && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <input 
                type="checkbox" 
                name="published" 
                id="published"
                checked={formData.published} 
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="published" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">Publish immediately</label>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-black/5 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating listing...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
