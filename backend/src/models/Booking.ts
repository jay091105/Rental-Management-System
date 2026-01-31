import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Reference to parent order if part of cart checkout
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rentalDuration: { type: String, enum: ['HOUR', 'DAY', 'MONTH'], required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  paymentMethod: { type: String, enum: ['COD', 'UPI'], default: 'COD' },
  isPaid: { type: Boolean, default: false },
  penaltyAmount: { type: Number, default: 0 },
  isDamaged: { type: Boolean, default: false },
  damageDescription: { type: String },
  damageCharge: { type: Number, default: 0 },
  trackingUpdates: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    message: String
  }],
  returnDate: { type: Date },
  returnStatus: { type: String, enum: ['ON_TIME', 'DELAYED', 'DAMAGED'], default: 'ON_TIME' }
}, { timestamps: true });

export const Booking = mongoose.model('Booking', bookingSchema);