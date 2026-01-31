import api from '../lib/axios';
import { Property, Rental, User } from '../types';

export const propertyService = {
  getAll: async (params?: Record<string, string | number>) => {
    const response = await api.get<{ data: Property[] }>('/products', { params });
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: Property }>(`/products/${id}`);
    return response.data.data;
  },
  // ... other methods
  create: async (data: Partial<Property>) => {
    const response = await api.post<{ data: Property }>('/products', data);
    return response.data.data;
  },
  update: async (id: string, data: Partial<Property>) => {
    const response = await api.put<{ data: Property }>(`/products/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
};

export const rentalService = {
  create: async (data: Record<string, unknown>) => {
    const response = await api.post<Rental>('/rentals', data);
    return response.data;
  },
  getMyRentals: async () => {
    const response = await api.get<Rental[]>('/rentals/my');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get<Rental[]>('/rentals');
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch<Rental>(`/rentals/${id}/status`, { status });
    return response.data;
  },
};

export const userService = {
  getAll: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
};

export const paymentService = {
  process: async (rentalId: string) => {
    const response = await api.post('/payments', { rentalId });
    return response.data;
  },
  processForInvoice: async (invoiceId: string) => {
    const response = await api.post('/payments', { invoiceId });
    return response.data;
  },
  processForOrder: async (orderId: string) => {
    const response = await api.post('/payments', { orderId });
    return response.data;
  },
  mock: async (paymentId: string, outcome: 'success' | 'failure') => {
    const response = await api.post(`/payments/${paymentId}/mock`, { outcome });
    return response.data;
  },
  getByRental: async (rentalId: string) => {
    const response = await api.get(`/payments/rental/${rentalId}`);
    return response.data;
  }
};

export const providerService = {
  getProperties: async () => {
    const response = await api.get('/provider/properties');
    return response.data.data;
  },
  getRentals: async () => {
    const response = await api.get('/provider/rentals');
    return response.data;
  }
};

export const reviewService = {
  addReview: async (data: { productId: string; rating: number; comment: string }) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },
  getPropertyReviews: async (productId: string) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },
};
