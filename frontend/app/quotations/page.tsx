'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch('/api/quotations/my');
        const data = await res.json();
        if (data.success) setQuotes(data.data || []);
      } catch (err) {
        console.error('Failed to fetch quotations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Quotations</h1>
        <p className="text-gray-600 mt-2">Your quotation requests.</p>

        {loading ? (
          <div className="mt-6">Loading...</div>
        ) : (
          <div className="mt-6 space-y-4">
            {quotes.length === 0 ? (
              <div className="text-gray-500">No quotations found.</div>
            ) : (
              quotes.map(q => (
                <div key={q._id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold">Quotation #{q._id}</div>
                      <div className="text-xs text-gray-500">Quantity: {q.quantity}</div>
                      <div className="text-xs text-gray-400">Status: {q.status}</div>
                    </div>
                    <div>
                      <a href={`/quotations/${q._id}`} className="text-blue-600">View</a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
