'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type RentalUnit = 'hour' | 'day' | 'month';

export interface VariantOption {
  id: string;
  name: string;
  priceModifier?: number; // added to base price
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'radio' | 'checkbox';
  options: VariantOption[];
}

export interface CartItem {
  id: string; // item id in cart
  productId: string;
  title: string;
  image?: string;
  basePrice: number;
  rentalUnit: RentalUnit;
  quantity: number;
  startDate?: string;
  endDate?: string;
  variants?: VariantOption[];
  subtotal: number;
}

export interface Address {
  name: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderState {
  items: CartItem[];
  deliveryMethod: 'delivery' | 'pickup';
  deliveryCharge: number;
  deliveryAddress?: Address;
  billingAddress?: Address;
  paymentStatus: 'pending' | 'paid' | 'failed' | null;
  orderId?: string;
}

const DEFAULT: OrderState = {
  items: [],
  deliveryMethod: 'delivery',
  deliveryCharge: 0,
  paymentStatus: null,
};

interface OrderContextValue extends OrderState {
  addItem: (item: Omit<CartItem, 'id' | 'subtotal'>) => void;
  updateItemQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  setRentalDates: (cartItemId: string, start?: string, end?: string) => void;
  setDeliveryMethod: (method: 'delivery' | 'pickup') => void;
  setDeliveryAddress: (addr: Address) => void;
  setBillingAddress: (addr: Address) => void;
  setPaymentStatus: (status: 'pending' | 'paid' | 'failed' | null) => void;
  createOrder: () => Promise<{ success: boolean; orderId?: string }>;
  clearOrder: () => void;
  subtotal: number;
  total: number;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<OrderState>(() => {
    try {
      const raw = localStorage.getItem('order_state');
      return raw ? (JSON.parse(raw) as OrderState) : DEFAULT;
    } catch (e) {
      return DEFAULT;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('order_state', JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  const recalc = (items: CartItem[]) => {
    const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
    const total = subtotal + (state.deliveryCharge || 0);
    return { subtotal, total };
  };

  const addItem = (item: Omit<CartItem, 'id' | 'subtotal'>) => {
    const id = uuidv4();
    const variantsTotal = (item.variants || []).reduce((s, v) => s + (v.priceModifier || 0), 0);
    const subtotal = (item.basePrice + variantsTotal) * (item.quantity || 1);
    const newItem: CartItem = { ...item, id, subtotal } as CartItem;
    const items = [...state.items, newItem];
    setState({ ...state, items });
  };

  const updateItemQuantity = (cartItemId: string, quantity: number) => {
    const items = state.items.map((it) => {
      if (it.id !== cartItemId) return it;
      const variantsTotal = (it.variants || []).reduce((s, v) => s + (v.priceModifier || 0), 0);
      const subtotal = (it.basePrice + variantsTotal) * quantity;
      return { ...it, quantity, subtotal };
    });
    setState({ ...state, items });
  };

  const removeItem = (cartItemId: string) => {
    const items = state.items.filter((it) => it.id !== cartItemId);
    setState({ ...state, items });
  };

  const setRentalDates = (cartItemId: string, start?: string, end?: string) => {
    const items = state.items.map((it) => it.id === cartItemId ? { ...it, startDate: start, endDate: end } : it);
    setState({ ...state, items });
  };

  const setDeliveryMethod = (method: 'delivery' | 'pickup') => {
    const deliveryCharge = method === 'delivery' ? 50 : 0;
    setState({ ...state, deliveryMethod: method, deliveryCharge });
  };

  const setDeliveryAddress = (addr: Address) => setState({ ...state, deliveryAddress: addr });
  const setBillingAddress = (addr: Address) => setState({ ...state, billingAddress: addr });
  const setPaymentStatus = (status: 'pending' | 'paid' | 'failed' | null) => setState({ ...state, paymentStatus: status });

  const clearOrder = () => {
    setState(DEFAULT);
  };

  const createOrder = async () => {
    // Simulate backend order creation and return an order id
    setPaymentStatus('pending');
    await new Promise((r) => setTimeout(r, 600));
    const orderId = 'ORD-' + Math.random().toString(36).slice(2, 9).toUpperCase();
    // Persist order to localStorage orders list
    try {
      const raw = localStorage.getItem('orders_history');
      const list = raw ? JSON.parse(raw) : [];
      const entry = { ...state, orderId, createdAt: new Date().toISOString() };
      list.push(entry);
      localStorage.setItem('orders_history', JSON.stringify(list));
    } catch (e) {}
    setState({ ...state, paymentStatus: 'paid', orderId });
    return { success: true, orderId };
  };

  const { subtotal, total } = recalc(state.items);

  const value: OrderContextValue = {
    ...state,
    addItem,
    updateItemQuantity,
    removeItem,
    setRentalDates,
    setDeliveryMethod,
    setDeliveryAddress,
    setBillingAddress,
    setPaymentStatus,
    createOrder,
    clearOrder,
    subtotal,
    total,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within OrderProvider');
  return ctx;
};
