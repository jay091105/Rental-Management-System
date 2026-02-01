const mongoose = require('mongoose');

// Extended invoice schema — keep legacy fields for backward compatibility but add
// explicit financial fields and relations required by the new auto-generation flow.
const InvoiceSchema = new mongoose.Schema({
  // existing/backwards-compatible
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number },
  status: { type: String, enum: ['draft', 'issued', 'paid', 'void'], default: 'draft' },
  issuedAt: Date,
  dueDate: Date,
  meta: Object,

  // new/explicit fields (preferred by new features)
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: { type: Array, default: [] },
  subtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  securityDeposit: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  // explicit paymentStatus for client-facing workflows (keeps `status` for legacy code)
  paymentStatus: { type: String, enum: ['draft', 'partial', 'paid'], default: 'draft' }
}, { timestamps: true });

// Indexes to speed up lookups used by provider/renter UIs and the new download endpoint
InvoiceSchema.index({ order: 1 });
InvoiceSchema.index({ vendor: 1 });
InvoiceSchema.index({ customer: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
