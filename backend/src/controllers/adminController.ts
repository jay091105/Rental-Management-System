import { Request, Response, NextFunction } from 'express';
import { Booking } from '../models/Booking';
import { Product } from '../models/Product';
import { User } from '../models/User';

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.find({ status: 'CONFIRMED' });
    const totalRevenue = confirmedBookings.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    res.json({
      totalBookings,
      totalRevenue,
      totalUsers,
      totalProducts,
      confirmedBookingsCount: confirmedBookings.length
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email').populate('product', 'name');
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};