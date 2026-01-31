'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Property } from '@/types';
import Link from 'next/link';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', location: '' });

  const fetchProperties = async () => {
    const params = new URLSearchParams(filters as any).toString();
    const { data } = await api.get(`/properties?${params}`);
    setProperties(data);
  };

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Available Properties</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="bg-white p-4 rounded shadow h-fit space-y-4">
          <h2 className="font-bold border-b pb-2">Filters</h2>
          <div>
            <label className="text-sm">Location</label>
            <input 
              className="form-input" 
              placeholder="e.g. New York" 
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            />
          </div>
          <div className="flex space-x-2">
            <div>
              <label className="text-sm">Min Price</label>
              <input 
                type="number" 
                className="form-input" 
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm">Max Price</label>
              <input 
                type="number" 
                className="form-input" 
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Property Grid */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
            <div key={p._id} className="bg-white rounded shadow overflow-hidden border">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <h3 className="font-bold text-lg">{p.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{p.location}</p>
                <p className="text-blue-600 font-bold">${p.price} / night</p>
                <Link 
                  href={`/properties/${p._id}`}
                  className="mt-4 block text-center btn-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}