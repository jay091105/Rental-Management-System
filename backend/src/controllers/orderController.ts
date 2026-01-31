import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Booking } from '../models/Booking';
import { Product } from '../models/Product';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../middleware/auth';

// Create order from cart (multiple products, grouped by vendor)
export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, paymentMethods } = req.body; // items: [{productId, startDate, endDate, rentalDuration, quantity}]
    
    if (!items || items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    // Group items by vendor and create bookings
    const vendorGroups: any = {};
    const bookings: any[] = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).populate('owner');
      if (!product) throw new ApiError(404, `Product ${item.productId} not found`);

      if (product.availableUnits < item.quantity) {
        throw new ApiError(400, `Insufficient units for ${product.name}`);
      }

      const vendorId = (product.owner as any)._id.toString();
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = {
          vendor: vendorId,
          bookings: [],
          totalAmount: 0,
          paymentMethod: paymentMethods[vendorId] || 'COD',
          paymentQRCode: (product.owner as any).paymentQRCode
        };
      }

      // Calculate price based on duration
      let unitPrice = 0;
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
      const days = Math.ceil(hours / 24);
      const months = Math.ceil(days / 30);

      if (item.rentalDuration === 'HOUR') {
        unitPrice = product.pricePerHour * hours;
      } else if (item.rentalDuration === 'DAY') {
        unitPrice = product.pricePerDay * days;
      } else if (item.rentalDuration === 'MONTH') {
        unitPrice = product.pricePerMonth * months;
      }

      const totalPrice = (unitPrice + product.deliveryCharges) * item.quantity;
      const totalDeposit = product.deposit * item.quantity;

      // Create booking for each quantity
      for (let i = 0; i < item.quantity; i++) {
        const booking = await Booking.create({
          user: req.user._id,
          product: item.productId,
          vendor: vendorId,
          startDate: item.startDate,
          endDate: item.endDate,
          rentalDuration: item.rentalDuration,
          totalPrice: unitPrice + product.deliveryCharges,
          paymentMethod: paymentMethods[vendorId] || 'COD',
          status: 'CONFIRMED'
        });
        bookings.push(booking._id);
        vendorGroups[vendorId].bookings.push(booking._id);
        vendorGroups[vendorId].totalAmount += (unitPrice + product.deliveryCharges + totalDeposit);
      }

      // Reduce available units (only if not already reduced)
      if (product.availableUnits >= item.quantity) {
        product.availableUnits -= item.quantity;
        await product.save();
      } else {
        throw new ApiError(400, `Insufficient units for ${product.name}. Only ${product.availableUnits} available.`);
      }
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      bookings,
      vendorGroups: Object.values(vendorGroups),
      totalAmount: Object.values(vendorGroups).reduce((sum: number, vg: any) => sum + vg.totalAmount, 0),
      status: 'CONFIRMED'
    });

    // Create notifications
    await Notification.create({
      user: req.user._id,
      order: order._id,
      type: 'ORDER_PLACED',
      title: 'Order Placed Successfully',
      message: `Your order #${order._id} has been placed successfully.`
    });

    // Notify each vendor
    for (const vendorId of Object.keys(vendorGroups)) {
      await Notification.create({
        user: vendorId,
        order: order._id,
        type: 'ORDER_CONFIRMED',
        title: 'New Order Received',
        message: `You have received a new order #${order._id}.`
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('bookings')
      .populate('vendorGroups.vendor', 'name companyLogo paymentQRCode');

    res.status(201).json(populatedOrder);
  } catch (error) {
    next(error);
  }
};

// Get user orders
export const getUserOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'bookings',
        populate: { path: 'product', populate: 'owner' }
      })
      .populate('vendorGroups.vendor', 'name companyLogo')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// Get vendor orders (only their products)
export const getVendorOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== 'VENDOR') {
      throw new ApiError(403, 'Only vendors can access this');
    }

    // Get all bookings for this vendor
    const bookings = await Booking.find({ vendor: req.user._id })
      .populate('product')
      .populate('user', 'name email')
      .populate('order');

    // Group by order
    const orderMap = new Map();
    bookings.forEach(booking => {
      if (booking.order) {
        const orderId = booking.order.toString();
        if (!orderMap.has(orderId)) {
          orderMap.set(orderId, {
            order: booking.order,
            bookings: []
          });
        }
        orderMap.get(orderId).bookings.push(booking);
      }
    });

    const orders = Array.from(orderMap.values());
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'bookings',
        populate: [
          { path: 'product', populate: 'owner' },
          { path: 'user', select: 'name email' }
        ]
      })
      .populate('vendorGroups.vendor', 'name companyLogo paymentQRCode');

    if (!order) throw new ApiError(404, 'Order not found');

    // Check authorization
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'VENDOR') {
      throw new ApiError(403, 'Unauthorized');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};
