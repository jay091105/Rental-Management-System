import api from '../lib/axios';
import { Product, Rental, User } from '../types';

export const productService = {
  getAll: async (params?: Record<string, string | number>) => {
    const response = await api.get<{ data: Product[] }>('/products', { params });
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: Product }>(`/products/${id}`);
    return response.data.data;
  },
  // Fetch availability for a product between dates (returns { availableUnits })
  getAvailability: async (id: string, startDate: string, endDate: string) => {
    const response = await api.get(`/products/${id}/availability`, { params: { startDate, endDate } });
    return response.data;
  },
  // ... other methods
  create: async (data: Partial<Product>) => {
    const response = await api.post<{ data: Product }>('/products', data);
    return response.data.data;
  },
  update: async (id: string, data: Partial<Product>) => {
    const response = await api.put<{ data: Product }>(`/products/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string) => {
    await api.delete(`/products/${id}`);
  },
};

// Backwards-compatible alias
export const propertyService = productService;

export const rentalService = {
  create: async (data: Record<string, unknown>): Promise<any> => {
    // server may return multiple envelopes (Rental | { order } | { success }) — keep client tolerant
    const response = await api.post<any>('/rentals', data);
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

export const invoiceService = {
  getMy: async () => {
    const response = await api.get('/invoices/my');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },
  // Download invoice PDF (returns blob)
  download: async (id: string) => {
    const response = await api.get(`/invoices/${id}/download`, { responseType: 'blob' });
    return response.data;
  }
};

export const providerService = {
  getProducts: async () => {
    const response = await api.get('/provider/products');
    return response.data.data;
  },
  getRentals: async () => {
    const response = await api.get('/provider/rentals');
    return response.data;
  }
};

// Backwards-compatible alias
export const providerServiceLegacy = { ...providerService, getProperties: providerService.getProducts };

export const orderService = {
  create: async (data: { productId: string; quantity?: number; startDate?: string; endDate?: string; rentalStart?: string; rentalEnd?: string }) => {
    const response = await api.post('/orders', data);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  getMyOrders: async () => {
    const response = await api.get('/orders/my');
    return response.data;
  },
  getProviderOrders: async () => {
    const response = await api.get('/orders/provider');
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },
  markPickup: async (id: string) => {
    const response = await api.post(`/orders/${id}/pickup`);
    return response.data;
  },
  markReturn: async (id: string, body?: { returnedAt?: string }) => {
    const response = await api.post(`/orders/${id}/return`, body || {});
    return response.data;
  }
};

export const quotationService = {
  create: async (data: { productId: string; quantity?: number; startDate?: string; endDate?: string; rentalStart?: string; rentalEnd?: string }) => {
    const response = await api.post('/quotations', data);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
  }
};

export const reviewService = {
  addReview: async (data: { productId: string; rating: number; comment: string }) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },
  getProductReviews: async (productId: string) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },
};

// Backwards-compatible alias
export const reviewServiceLegacy = { ...reviewService, getPropertyReviews: reviewService.getProductReviews };
