import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-extrabold mb-6">Find Your Perfect Rental</h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
        Discover top-rated properties and book your next stay with ease. 
        Secure, reliable, and user-friendly rental management.
      </p>
      <div className="space-x-4">
        <Link href="/properties" className="btn-primary text-lg px-8 py-3">
          Browse Properties
        </Link>
        <Link href="/register" className="bg-gray-200 text-gray-800 text-lg px-8 py-3 rounded hover:bg-gray-300 transition">
          Join Now
        </Link>
      </div>
    </div>
  );
}