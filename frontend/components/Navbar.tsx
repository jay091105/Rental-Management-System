'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">RentalMgmt</Link>
        <div className="space-x-4">
          <Link href="/properties">Properties</Link>
          {user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/bookings">My Bookings</Link>
              {user.role === 'ADMIN' && <Link href="/admin">Admin</Link>}
              <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;