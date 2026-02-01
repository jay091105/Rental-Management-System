const mongoose = require('mongoose');

const PickupSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scheduledAt: { type: Date },
  pickedAt: { type: Date },
  notes: { type: String },
  meta: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Pickup', PickupSchema);
