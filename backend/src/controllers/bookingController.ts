import { Request, Response, NextFunction } from 'express';
import { Booking } from '../models/Booking';
import { Property } from '../models/Property';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../middleware/auth';

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { propertyId, startDate, endDate, totalPrice } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) throw new ApiError(404, 'Property not found');

    // Conflict prevention
    const overlappingBooking = await Booking.findOne({
      property: propertyId,
      status: 'CONFIRMED',
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });

    if (overlappingBooking) {
      throw new ApiError(400, 'Property is already booked for these dates');
    }

    const booking = await Booking.create({
      user: req.user._id,
      property: propertyId,
      startDate,
      endDate,
      totalPrice,
      status: 'CONFIRMED'
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('property');
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'CANCELLED' },
      { new: true }
    );
    if (!booking) throw new ApiError(404, 'Booking not found or unauthorized');
    res.json(booking);
  } catch (error) {
    next(error);
  }
};