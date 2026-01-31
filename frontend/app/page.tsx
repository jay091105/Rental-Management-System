import Link from 'next/link';
import { Building, ShieldCheck, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          Find Your Perfect <span className="text-blue-600">Rental Home</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Browse thousands of curated properties, from cozy apartments to luxury villas.
          Manage your rentals with ease and security.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/properties"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Browse Properties
          </Link>
          <Link
            href="/register"
            className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            List Your Property
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="text-center space-y-4">
          <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-blue-600">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Curated Listings</h3>
          <p className="text-gray-600">
            We handpick properties to ensure they meet our quality and safety standards.
          </p>
        </div>
        <div className="text-center space-y-4">
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-green-600">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Secure Booking</h3>
          <p className="text-gray-600">
            Your payments and personal data are protected by state-of-the-art security.
          </p>
        </div>
        <div className="text-center space-y-4">
          <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-purple-600">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Instant Support</h3>
          <p className="text-gray-600">
            Our dedicated team is here to help you 24/7 with any questions or issues.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 rounded-2xl p-12 text-center text-white space-y-6">
        <h2 className="text-3xl font-bold">Ready to find your next home?</h2>
        <p className="text-blue-100 text-lg">
          Join thousands of happy renters and owners today.
        </p>
        <Link
          href="/register"
          className="inline-block bg-white text-blue-600 px-10 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
        >
          Get Started Now
        </Link>
      </section>
    </div>
  );
}
