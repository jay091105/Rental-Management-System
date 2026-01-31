'use client';

import { useState, useEffect } from 'react';
import { propertyService } from '@/services/api';
import { Property } from '@/types';
import Link from 'next/link';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MapPin, Search, Building, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await propertyService.getAll();
        setProperties(data);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
        // Mock data for UI verification
        setProperties([
          { id: '1', title: 'Luxury Villa', description: 'Nice place', price: 2000, location: 'Miami', images: [], ownerId: '1', status: 'available' },
          { id: '2', title: 'Cozy Studio', description: 'Small but gold', price: 800, location: 'New York', images: [], ownerId: '2', status: 'available' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Properties</h1>
            <p className="text-gray-500">Find your next dream home from our curated list.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {(user?.role === 'admin' || user?.role === 'owner') && (
              <Link
                href="/properties/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-md whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Property
              </Link>
            )}
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No properties found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
              >
                <div className="h-56 bg-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <Building className="w-16 h-16" />
                  </div>
                  {property.images?.[0] && (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                      property.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl text-blue-600 font-extrabold shadow-lg">
                    ${property.price}<span className="text-[10px] text-gray-400 font-normal">/mo</span>
                  </div>
                </div>
                <div className="p-6 space-y-4 flex-grow flex flex-col">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition truncate">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-gray-500 gap-1.5 text-sm">
                      <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="truncate">{property.location}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-50 mt-auto flex justify-between items-center">
                    <span className="text-blue-600 font-bold text-sm">View Details</span>
                    <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
