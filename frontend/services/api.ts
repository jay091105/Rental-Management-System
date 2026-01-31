import api from '../lib/axios';
import { Property, Booking, User } from '../types';

export const propertyService = {
  getAll: async () => {
    const response = await api.get<Property[]>('/properties');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Property>(`/properties/${id}`);
    return response.data;
  },
  create: async (data: Partial<Property>) => {
    const response = await api.post<Property>('/properties', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Property>) => {
    const response = await api.put<Property>(`/properties/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/properties/${id}`);
  },
};

export const bookingService = {
  create: async (data: Record<string, unknown>) => {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  },
  getMyBookings: async () => {
    const response = await api.get<Booking[]>('/bookings/my');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get<Booking[]>('/bookings');
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch<Booking>(`/bookings/${id}/status`, { status });
    return response.data;
  },
};

export const userService = {
  getAll: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
};
