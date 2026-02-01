const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  returnedAt: { type: Date },
  lateFee: { type: Number, default: 0 },
  notes: { type: String },
  meta: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Return', ReturnSchema);
