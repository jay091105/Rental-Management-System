const Rental = require('../models/Rental');
const Product = require('../models/Product');

// Helper to map rental document to frontend-friendly shape
const mapRental = (r) => ({
  id: r._id.toString(),
  product: r.product,
  productId: r.product?._id ? r.product._id.toString() : r.product,
  renterId: r.user?._id ? r.user._id.toString() : r.user,
  startDate: r.startDate?.toISOString?.().split('T')[0] || r.startDate,
  endDate: r.endDate?.toISOString?.().split('T')[0] || r.endDate,
  quantity: r.quantity || 1,
  status: r.rentalStatus || 'pending',
  totalPrice: r.totalCost || r.totalPrice || 0,
  payment: r.payment || null,
  paymentRequired: !!r.paymentRequired,
  createdAt: r.createdAt,
});

// @desc    Create a rental
// @route   POST /api/rentals
// @access  Private
exports.createRental = async (req, res, next) => {
  try {
    const { productId, startDate, endDate, quantity = 1, rentalDuration } = req.body;

    if (!productId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'productId, startDate and endDate are required' });
    }

    const sd = new Date(startDate);
    const ed = new Date(endDate);

    // Validate dates (allow same-day rentals — start may be equal to end)
    if (isNaN(sd.getTime()) || isNaN(ed.getTime()) || sd > ed) {
      return res.status(400).json({ success: false, message: 'Invalid dates: startDate must be on or before endDate' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Disallow rentals on unpublished products
    if (!product.published) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate quantity
    const reqQty = Number(quantity) || 1;
    if (reqQty < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    if (product.availableUnits != null && reqQty > product.availableUnits) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available units' });
    }

    // Check overlapping rentals for the same product
    const overlapping = await Rental.find({
      product: product._id,
      rentalStatus: { $in: ['pending', 'approved', 'confirmed', 'active'] },
      $or: [
        { startDate: { $lte: ed }, endDate: { $gte: sd } }
      ]
    });

    const reserved = overlapping.reduce((sum, r) => sum + (r.quantity || 1), 0);
    if (product.availableUnits != null && (reserved + reqQty) > product.availableUnits) {
      return res.status(409).json({ success: false, message: 'Insufficient available units for selected dates' });
    }

    // Basic total price calculation (fallback to product.price if specific duration price missing)
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.max(1, Math.ceil(Math.abs(ed - sd) / msPerDay));

    const unitPrice = rentalDuration === 'HOUR' ? (product.pricePerHour || product.price || 0)
      : rentalDuration === 'MONTH' ? (product.pricePerMonth || product.price || 0)
      : (product.pricePerDay || product.price || 0);

    const totalCost = unitPrice * days * reqQty;

    const rental = await Rental.create({
      product: product._id,
      user: req.user._id,
      startDate: sd,
      endDate: ed,
      quantity: reqQty,
      totalCost,
      rentalStatus: 'pending'
    });

    // populate product for response
    await rental.populate({ path: 'product', select: 'title images price status' });

    res.status(201).json({ success: true, data: mapRental(rental) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get current user's rentals
// @route   GET /api/rentals/my
// @access  Private
exports.getMyRentals = async (req, res, next) => {
  try {
    const rentals = await Rental.find({ user: req.user._id }).populate({ path: 'product', select: 'title images price status' }).sort('-createdAt');
    res.status(200).json(rentals.map(mapRental));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all rentals
// @route   GET /api/rentals
// @access  Private
exports.getAllRentals = async (req, res, next) => {
  try {
    // For now return all rentals; frontend will filter as needed
    const rentals = await Rental.find().populate({ path: 'product', select: 'title images price status' }).sort('-createdAt');
    res.status(200).json(rentals.map(mapRental));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update rental status
// @route   PATCH /api/rentals/:id/status
// @access  Private
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const allowed = ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'confirmed'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const rental = await Rental.findById(id).populate({ path: 'product', select: 'title images price status owner availableUnits' }).populate('user');
    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found' });

    const prev = rental.rentalStatus;

    // Define allowed transitions
    const transitions = {
      pending: ['approved', 'rejected', 'cancelled'],
      approved: ['active', 'cancelled', 'rejected'],
      active: ['completed', 'cancelled'],
      confirmed: ['active', 'cancelled'],
      rejected: [],
      completed: [],
      cancelled: []
    };

    if (!transitions[prev].includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid transition from ${prev} to ${status}` });
    }

    // Authorization checks
    // Approve/reject/confirm must be done by product owner (provider) or admin
    if (['approved', 'rejected', 'confirmed'].includes(status)) {
      const isOwner = rental.product.owner && rental.product.owner.toString() === req.user.id;
      if (!isOwner && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to change this status' });
      }
    }

    // Cancel can be initiated by renter or admin or provider
    if (status === 'cancelled') {
      const isRenter = rental.user && rental.user._id && rental.user._id.toString() === req.user.id;
      const isOwner = rental.product.owner && rental.product.owner.toString() === req.user.id;
      if (!isRenter && !isOwner && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to cancel this rental' });
      }
    }

    // Handle inventory adjustments when moving into/out of approved state
    if (prev !== 'approved' && status === 'approved') {
      // reserve units
      if (rental.product.availableUnits != null && rental.product.availableUnits < (rental.quantity || 1)) {
        return res.status(400).json({ success: false, message: 'Insufficient available units to approve this rental' });
      }
      rental.product.availableUnits = Math.max(0, rental.product.availableUnits - (rental.quantity || 1));
      await rental.product.save();

      // Create a Payment record (pending) to be paid by renter
      const Payment = require('../models/Payment');
      let existingPayment = await Payment.findOne({ rental: rental._id });
      if (!existingPayment) {
        const payment = await Payment.create({
          rental: rental._id,
          renter: rental.user,
          provider: rental.product.owner,
          amount: rental.totalCost,
          status: 'pending'
        });
        rental.payment = payment._id;
        rental.paymentRequired = true;
      }
    }

    if (prev === 'approved' && status !== 'approved') {
      // release units
      if (rental.product.availableUnits != null) {
        rental.product.availableUnits = rental.product.availableUnits + (rental.quantity || 1);
        await rental.product.save();
      }
    }

    rental.rentalStatus = status;
    await rental.save();

    res.status(200).json({ success: true, data: mapRental(rental) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc Advance rental statuses based on current date (minimal cron)
exports.advanceStatuses = async (req, res, next) => {
  try {
    const now = new Date();

    // approved -> active if startDate <= now
    const toActive = await Rental.find({ rentalStatus: 'approved', startDate: { $lte: now } });
    for (const r of toActive) {
      r.rentalStatus = 'active';
      await r.save();
    }

    // active -> completed if endDate <= now
    const toComplete = await Rental.find({ rentalStatus: 'active', endDate: { $lte: now } });
    for (const r of toComplete) {
      r.rentalStatus = 'completed';
      await r.save();
    }

    res.status(200).json({ success: true, advanced: { activated: toActive.length, completed: toComplete.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};