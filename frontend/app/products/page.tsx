'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page was retired: it was a legacy mock catalog that duplicated `/properties`.
// Kept a small redirect here so existing links don't 404 and to make the change reversible.
export default function ProductsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/properties');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium">This legacy page was retired — redirecting to the catalog...</p>
      </div>
    </div>
  );
}
