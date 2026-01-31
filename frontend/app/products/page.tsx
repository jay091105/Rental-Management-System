'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brandName: '',
    colour: '',
    minPrice: '',
    maxPrice: ''
  });

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams(filters as any).toString();
      const { data } = await api.get(`/products?${params}`);
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Available for Rent</h1>
      
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 bg-gray-50 p-4 rounded-lg shadow-sm">
        <input
          name="search"
          placeholder="Search products..."
          className="form-input"
          value={filters.search}
          onChange={handleFilterChange}
        />
        <input
          name="category"
          placeholder="Category"
          className="form-input"
          value={filters.category}
          onChange={handleFilterChange}
        />
        <input
          name="brandName"
          placeholder="Brand"
          className="form-input"
          value={filters.brandName}
          onChange={handleFilterChange}
        />
        <input
          name="colour"
          placeholder="Colour"
          className="form-input"
          value={filters.colour}
          onChange={handleFilterChange}
        />
        <input
          name="minPrice"
          type="number"
          placeholder="Min Price"
          className="form-input"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <input
          name="maxPrice"
          type="number"
          placeholder="Max Price"
          className="form-input"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <Link key={product._id} href={`/products/${product._id}`}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
              <div className="h-48 bg-gray-200 relative">
                {product.photos && product.photos[0] ? (
                  <img src={product.photos[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{product.category}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-2xl font-bold text-blue-600">₹{product.price}</span>
                  <span className="text-sm text-gray-500">{product.availableUnits} left</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No products found matching your criteria.
        </div>
      )}
    </div>
  );
}