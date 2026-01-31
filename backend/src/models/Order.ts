import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  // Grouped by vendor for separate invoices
  vendorGroups: [{
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'UPI'], required: true },
    isPaid: { type: Boolean, default: false },
    paymentQRCode: { type: String } // Vendor's QR code for this order
  }],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING'
  }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
