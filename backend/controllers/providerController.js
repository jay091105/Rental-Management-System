const Product = require('../models/Product');
const Rental = require('../models/Rental');
const User = require('../models/User');

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ owner: req.user.id }).sort('-createdAt');
    try { console.debug(`[providerController] provider ${req.user.id} has ${products.length} products`); } catch(e) {}
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getRentals = async (req, res, next) => {
  try {
    // Find rentals for properties owned by this provider
    const myProducts = await Product.find({ owner: req.user.id }).select('_id');
    const productIds = myProducts.map(p => p._id);

    const rentals = await Rental.find({ product: { $in: productIds } }).populate('product').populate('user').sort('-createdAt');

    // produce simple stats
    const stats = rentals.reduce((acc, r) => {
      acc.total = (acc.total || 0) + 1;
      acc[r.rentalStatus] = (acc[r.rentalStatus] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({ success: true, count: rentals.length, stats, data: rentals });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Deactivate (or soft-delete) a provider account and disable their products
// @route   PATCH /api/provider/:id/deactivate
// @access  Private (provider self or admin)
exports.deactivateProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await User.findById(id);
    if (!target || target.role !== 'provider') return res.status(404).json({ success: false, message: 'Provider not found' });

    // Only provider themself or admin may perform this action
    if (req.user.role === 'provider' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Not authorized to deactivate this provider' });
    }

    // Soft-delete provider
    target.isActive = false;
    target.deletedAt = new Date();
    await target.save();

    // Disable all products owned by provider: unpublish and mark owner inactive
    await Product.updateMany({ owner: target._id }, { $set: { published: false, ownerActive: false, ownerDisabledAt: new Date() } });

    res.status(200).json({ success: true, message: 'Provider deactivated and products disabled' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reactivate provider and optionally restore their products that were disabled at deactivation
// @route   PATCH /api/provider/:id/reactivate
// @access  Private (provider self or admin)
exports.reactivateProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await User.findById(id);
    if (!target || target.role !== 'provider') return res.status(404).json({ success: false, message: 'Provider not found' });

    // Only provider themself or admin may perform this action
    if (req.user.role === 'provider' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Not authorized to reactivate this provider' });
    }

    target.isActive = true;
    target.deletedAt = null;
    await target.save();

    // Restore products that were specifically disabled due to owner deactivation
    await Product.updateMany({ owner: target._id, ownerDisabledAt: { $ne: null } }, { $set: { published: true, ownerActive: true }, $unset: { ownerDisabledAt: "" } });

    res.status(200).json({ success: true, message: 'Provider reactivated and previously disabled products restored' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Soft-delete provider account (alias for deactivate)
// @route   DELETE /api/provider/:id
// @access  Private (provider self or admin)
exports.deleteProvider = async (req, res, next) => {
  try {
    // Reuse deactivate behavior to ensure safe cleanup
    req.params.id = req.params.id;
    return exports.deactivateProvider(req, res, next);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};