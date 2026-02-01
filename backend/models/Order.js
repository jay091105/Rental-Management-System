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
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  // optional history of status changes (added for renter tracking UI)
  statusHistory: [
    {
      status: String,
      at: Date,
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
