const Product = require('../models/Product');
const Rental = require('../models/Rental');

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