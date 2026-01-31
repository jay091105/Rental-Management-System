export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'renter';
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  ownerId: string;
  status: 'available' | 'rented';
}

export interface Booking {
  id: string;
  propertyId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  property?: Property;
  renter?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}
