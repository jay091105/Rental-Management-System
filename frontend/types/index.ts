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

// Alias for incremental rename: Product is equivalent to Property for now
export type Product = Property;

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
  _id?: string; // support backend _id as well as id
  productId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  quantity?: number;
  status: 'pending' | 'approved' | 'confirmed' | 'rejected' | 'active' | 'completed' | 'cancelled';
  totalPrice: number;
  payment?: string | null;
  paymentRequired?: boolean;
  product?: Property;
  renter?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}
