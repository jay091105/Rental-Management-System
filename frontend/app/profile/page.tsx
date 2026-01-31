'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { User, Mail, Shield, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-blue-600 h-32 flex items-center justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg translate-y-8">
              <User className="w-16 h-16 text-blue-600" />
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-8 text-center space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 flex items-center justify-center gap-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-semibold uppercase text-xs tracking-wider mx-auto w-max">
              <Shield className="w-4 h-4" />
              Role: {user?.role}
            </div>

            <div className="pt-8 border-t border-gray-100">
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
