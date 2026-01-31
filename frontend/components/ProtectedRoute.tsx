'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'owner' | 'tenant')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      console.log("[PROTECTED ROUTE] Access check:", {
        isAuthenticated,
        role: user?.role,
        allowedRoles
      });

      if (!isAuthenticated) {
        console.log("[PROTECTED ROUTE] Redirecting to /login: Unauthenticated");
        router.push('/login');
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        console.log("[PROTECTED ROUTE] Redirecting to /: Unauthorized role");
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, router, user, allowedRoles]);

  if (loading || !isAuthenticated) {
    return <Loading />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;
