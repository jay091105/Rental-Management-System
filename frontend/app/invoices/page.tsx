'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { paymentService, invoiceService } from '@/services/api';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await invoiceService.getMy();
        if (data.success) setInvoices(data.data || []);
      } catch (err) {
        console.error('Failed to fetch invoices', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handlePay = async (invoiceId: string) => {
    try {
      const result = await paymentService.processForInvoice(invoiceId);
      const paymentId = result.data._id || result.data.id;
      if (paymentId) {
        await paymentService.mock(paymentId, 'success');
        // refresh
        const data = await invoiceService.getMy();
        if (data.success) setInvoices(data.data || []);
      }
    } catch (err) {
      console.error('Payment error', err);
      alert('Payment failed');
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-gray-600 mt-2">Invoices for orders and billing.</p>

        {loading ? (
          <div className="mt-6">Loading...</div>
        ) : (
          <div className="mt-6 space-y-4">
            {invoices.length === 0 ? (
              <div className="text-gray-500">No invoices found.</div>
            ) : (
              invoices.map(inv => (
                <div key={inv._id} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold">Invoice #{inv._id}</div>
                      <div className="text-xs text-gray-500">Amount: ${inv.amount}</div>
                      <div className="text-xs text-gray-400">Status: {inv.status}</div>
                    </div>
                    <div>
                      {inv.status !== 'paid' && (
                        <button onClick={() => handlePay(inv._id)} className="bg-emerald-600 text-white px-3 py-1 rounded">Pay</button>
                      )}
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
