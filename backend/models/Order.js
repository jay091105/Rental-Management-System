const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental' },
  items: [
    {
      productSnapshot: Object,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
