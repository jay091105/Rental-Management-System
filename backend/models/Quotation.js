const mongoose = require('mongoose');

const QuotationSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  status: { type: String, enum: ['requested','draft','accepted','rejected'], default: 'requested' },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Quotation', QuotationSchema);