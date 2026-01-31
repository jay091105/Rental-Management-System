export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  companyLogo?: string;
  paymentQRCode?: string;
}

export interface Product {
  _id: string;
  name: string;
  brandName: string;
  category: string;
  colour?: string;
  pricePerHour: number;
  pricePerDay: number;
  pricePerMonth: number;
  basePrice: number;
  availableUnits: number;
  description?: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    companyLogo?: string;
    paymentQRCode?: string;
  };
  photos?: string[];
  deposit: number;
  deliveryCharges: number;
  penaltyPerHour: number;
  penaltyPerDay: number;
  penaltyPerMonth: number;
  paymentOptions: ('COD' | 'UPI')[];
}

export interface Booking {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  product: string | Product;
  vendor: string | { _id: string; name: string; companyLogo?: string };
  order?: string;
  startDate: string;
  endDate: string;
  rentalDuration: 'HOUR' | 'DAY' | 'MONTH';
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
  paymentMethod: 'COD' | 'UPI';
  isPaid: boolean;
  penaltyAmount: number;
  isDamaged: boolean;
  damageDescription?: string;
  damageCharge: number;
  trackingUpdates: Array<{
    status: string;
    timestamp: string;
    message?: string;
  }>;
  returnDate?: string;
  returnStatus?: 'ON_TIME' | 'DELAYED' | 'DAMAGED';
}

export interface Order {
  _id: string;
  user: string | User;
  bookings: string[] | Booking[];
  vendorGroups: Array<{
    vendor: string | User;
    bookings: string[] | Booking[];
    totalAmount: number;
    paymentMethod: 'COD' | 'UPI';
    isPaid: boolean;
    paymentQRCode?: string;
  }>;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  order?: string;
  booking?: string;
  type: 'ORDER_PLACED' | 'ORDER_CONFIRMED' | 'ORDER_SHIPPED' | 'ORDER_OUT_FOR_DELIVERY' | 
        'ORDER_DELIVERED' | 'ORDER_CANCELLED' | 'RETURN_REMINDER' | 'RETURN_CONFIRMED';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  _id: string;
  booking: string;
  sender: string | { _id: string; name: string };
  receiver: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  startDate: string;
  endDate: string;
  rentalDuration: 'HOUR' | 'DAY' | 'MONTH';
  quantity: number;
}