import axiosInstance from './axiosInstance';
import { AuthResponse } from '../types/user';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Log request payload for debugging
    console.log('[AUTH SERVICE] POST /auth/login', { email, password: '***' });
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      console.log('[AUTH SERVICE] Login response successful');
      return response.data;
    } catch (error: unknown) {
      // preserve original behavior but avoid `any`
      console.log('[AUTH SERVICE] Login error status:', (error as any)?.response?.status);
      throw error;
    }
  },
  register: async (userData: Record<string, unknown>): Promise<AuthResponse> => {
    console.log('[AUTH SERVICE] POST /auth/register', { ...userData, password: '***' });
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/register', userData);
      console.log('[AUTH SERVICE] Register response successful');
      return response.data;
    } catch (error: unknown) {
      console.log('[AUTH SERVICE] Register error status:', (error as any)?.response?.status);
      throw error;
    }
  },
};
