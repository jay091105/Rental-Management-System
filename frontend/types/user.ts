export type UserRole = 'admin' | 'provider' | 'renter';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
