'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { authService } from '../services/auth.service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  redirectUser: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
          try {
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser && typeof parsedUser === 'object' && parsedUser.role) {
              setUser(parsedUser);
            } else {
              throw new Error('Invalid user data structure');
            }
          } catch {
            throw new Error('Corrupted user data in localStorage');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Listen for logout broadcasts (other tabs)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'logout') {
        setUser(null);
        router.push('/login');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, [router]);
  const redirectUser = (role: string) => {
    let dashboardPath = '/properties';
    switch (role) {
      case 'admin':
        dashboardPath = '/admin/dashboard';
        break;
      case 'provider':
        dashboardPath = '/provider/dashboard';
        break;
      case 'renter':
        dashboardPath = '/renter/dashboard';
        break;
    }
    console.log("[AUTH CONTEXT] Redirecting to:", dashboardPath);
    router.replace(dashboardPath);
  };

  const login = async (email: string, password: string) => {
    console.log("[AUTH CONTEXT] login called for:", email);
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      console.log("[AUTH CONTEXT] Token received:", data.token ? "YES" : "NO");
      console.log("[AUTH CONTEXT] User object received:", data.user);
      
      // Redirect must happen only when: response.success === true AND token exists
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log("[AUTH CONTEXT] Auth state updated, role:", data.user.role);
        setUser(data.user);
        redirectUser(data.user.role);
      } else {
        console.log("[AUTH CONTEXT] Login response missing success, token or user");
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        console.error('[AUTH CONTEXT] Login error detail:', axiosError.response?.data || error);
      } else {
        console.error('[AUTH CONTEXT] Login error:', error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Record<string, unknown>) => {
    console.log("[AUTH CONTEXT] register called for:", userData.email);
    try {
      setLoading(true);
      const data = await authService.register(userData);
      console.log("[AUTH CONTEXT] Token received:", data.token ? "YES" : "NO");
      console.log("[AUTH CONTEXT] User object received:", data.user);

      // Redirect must happen only when: response.success === true AND token exists
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log("[AUTH CONTEXT] Auth state updated, role:", data.user.role);
        setUser(data.user);
        redirectUser(data.user.role);
      } else {
        console.log("[AUTH CONTEXT] Register response missing success, token or user");
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        console.error('[AUTH CONTEXT] Registration error detail:', axiosError.response?.data || error);
      } else {
        console.error('[AUTH CONTEXT] Registration error:', error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        redirectUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
