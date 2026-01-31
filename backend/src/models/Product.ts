import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brandName: { type: String, required: true },
  category: { type: String, required: true },
  colour: { type: String },
  deliveryCharges: { type: Number, default: 0 },
  availableUnits: { type: Number, required: true, default: 1 },
  photos: [{ type: String }],
  description: { type: String },
  // Pricing per duration
  pricePerHour: { type: Number, default: 0 },
  pricePerDay: { type: Number, default: 0 },
  pricePerMonth: { type: Number, default: 0 },
  // Base price for filtering
  basePrice: { type: Number, required: true },
  deposit: { type: Number, required: true, default: 0 },
  penaltyPerHour: { type: Number, default: 0 },
  penaltyPerDay: { type: Number, default: 0 },
  penaltyPerMonth: { type: Number, default: 0 },
  paymentOptions: { 
    type: [String], 
    enum: ['COD', 'UPI'], 
    default: ['COD', 'UPI'] 
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);