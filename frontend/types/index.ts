export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'provider' | 'renter';
}

export interface Property {
  _id: string;
  id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  pricePerHour: number;
  pricePerDay: number;
  pricePerMonth: number;
  category: string;
  location: string;
  images: string[];
  photos: string[];
  brandName: string;
  colour: string;
  ownerId: string;
  status: 'available' | 'rented';
  averageRating?: number;
  numOfReviews?: number;
  availableUnits: number;
  deliveryCharges: number;
  deposit: number;
}

export interface Review {
  _id: string;
  product: string;
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Rental {
  id: string;
  productId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  product?: Property;
  renter?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}
