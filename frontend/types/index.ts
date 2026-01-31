export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  availability: boolean;
  location: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  images?: string[];
}

export interface Booking {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  property: string | Property;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}