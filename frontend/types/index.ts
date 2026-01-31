export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'provider' | 'renter';
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  ownerId: string;
  status: 'available' | 'rented';
  averageRating?: number;
  numOfReviews?: number;
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
  product?: Product;
  renter?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}
