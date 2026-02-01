const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // support single-item `product` for backward compat and an explicit `items` array for full quotations
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
      rentalStart: Date,
      rentalEnd: Date,
      pricePerUnit: Number
    }
  ],
  status: { type: String, enum: ['draft','sent','confirmed','cancelled'], default: 'draft' },
  totalAmount: { type: Number, default: 0 },
  expiresAt: Date,
  notes: String,
  meta: Object
}, { timestamps: true });

module.exports = mongoose.model('Quotation', QuotationSchema);