const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental' },
  meta: Object,
  items: [
    {
      productSnapshot: Object,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: { type: Number, required: true, default: 0 },
  // extended lifecycle states — keep existing values and add pickup/return states (backward-compatible)
  status: { type: String, enum: ['pending', 'confirmed', 'picked_up', 'returned', 'cancelled', 'completed', 'late'], default: 'pending' },
  // optional history of status changes (added for renter tracking UI)
  statusHistory: [
    {
      status: String,
      at: Date,
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  notes: String,
  // bookkeeping for deposits / late-fees (populated by payment/return flows)
  financial: {
    depositHeld: { type: Number, default: 0 },
    lateFee: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
