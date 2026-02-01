const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res, next) => {
    try {
        const { productId, quantity = 1, rentalId, notes, rentalStart, rentalEnd } = req.body;
        if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        // Determine rental period & quantity (support rentalId or direct dates)
        let reqStart = rentalStart;
        let reqEnd = rentalEnd;
        let reqQuantity = Number(quantity || 1);
        if (rentalId) {
          const Rental = require('../models/Rental');
          const rental = await Rental.findById(rentalId);
          if (rental) {
            reqStart = rental.startDate;
            reqEnd = rental.endDate;
            reqQuantity = rental.quantity || reqQuantity;
          }
        }

        // If dates provided, run DB-level reservation check to prevent overbooking
        if (reqStart && reqEnd) {
          const { reservedQuantity } = require('../utils/availability');
          const reserved = await reservedQuantity(productId, reqStart, reqEnd);
          const available = Math.max(0, Number(product.availableUnits || 0) - Number(reserved || 0));
          if (reqQuantity > available) {
            return res.status(400).json({ success: false, message: 'Requested quantity not available for selected dates' });
          }
        }

        const order = await Order.create({
            renter: req.user.id,
            provider: product.owner,
            product: productId,
            rental: rentalId,
            items: [{ productSnapshot: { title: product.title, id: product._id }, quantity: reqQuantity, price: product.price || product.pricePerDay || 0 }],
            totalAmount: (product.price || product.pricePerDay || 0) * reqQuantity,
            notes,
            meta: {
              rentalStart: reqStart,
              rentalEnd: reqEnd,
              quantity: reqQuantity
            }
        });

        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('product renter provider');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        // Authorization: renter or provider or admin
        if (order.renter._id.toString() !== req.user.id && order.provider._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }

        // Build a lightweight timeline for client tracking UI (backwards-compatible)
        const timeline = [];
        // Requested
        if (order.createdAt) timeline.push({ key: 'requested', label: 'Requested', at: order.createdAt });
        // Include explicit statusHistory entries if available (preferred)
        if (Array.isArray(order.statusHistory) && order.statusHistory.length > 0) {
          order.statusHistory.forEach(h => {
            timeline.push({ key: h.status, label: h.status.charAt(0).toUpperCase() + h.status.slice(1), at: h.at, by: h.by });
          });
        } else {
          // Fallback: infer from status and updatedAt
          if (order.status && order.status !== 'pending' && order.updatedAt) {
            timeline.push({ key: order.status, label: order.status.charAt(0).toUpperCase() + order.status.slice(1), at: order.updatedAt });
          }
        }

        const out = order.toObject ? order.toObject() : order;
        out.timeline = timeline;

        res.status(200).json({ success: true, data: out });
    } catch (err) {
        next(err);
    }
};

// SSE stream for a single order (keeps connection open and pushes order updates)
exports.streamOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate('product renter provider');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Authorization
    if (order.renter._id.toString() !== req.user.id && order.provider._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this stream' });
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    // Helper to send an event
    const send = (event, payload) => {
      try {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      } catch (e) { /* ignore write errors */ }
    };

    // Send initial state
    send('order.initial', { order: order.toObject ? order.toObject() : order });

    // Listener
    const onUpdate = (msg) => {
      // only forward events for this order
      send('order.update', msg);
    };

    emitter.on(`order:${orderId}`, onUpdate);

    // keep-alive ping every 20s to prevent some proxies from closing the connection
    const keepAlive = setInterval(() => { try { res.write(': ping\n\n'); } catch (e) {} }, 20000);

    // Cleanup on client disconnect
    req.on('close', () => {
      clearInterval(keepAlive);
      emitter.removeListener(`order:${orderId}`, onUpdate);
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ renter: req.user.id }).populate('product provider');
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        next(err);
    }
};

exports.getProviderOrders = async (req, res, next) => {
    try {
        // Primary: orders where provider field matches
        const direct = await Order.find({ provider: req.user.id }).populate('product renter rental');

        // Secondary: catch orders that for some reason don't have `provider` set but the underlying
        // product is owned by this user (defensive; covers older/misaligned documents).
        const Product = require('../models/Product');
        const owned = await Product.find({ owner: req.user.id }).select('_id');
        const ownedIds = owned.map(p => p._id).filter(Boolean);

        let byProduct = [];
        if (ownedIds.length > 0) {
            byProduct = await Order.find({ provider: { $in: [null, undefined] }, product: { $in: ownedIds } }).populate('product renter rental');
        }

        // Merge and dedupe by _id
        const map = new Map();
        [...direct, ...byProduct].forEach(o => map.set(o._id.toString(), o));
        const orders = Array.from(map.values());

        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        next(err);
    }
};

const emitter = require('../utils/events');

exports.updateStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const { status } = req.body;

    // allow extended lifecycle states but validate
    const allowed = ['pending','confirmed','picked_up','returned','cancelled','completed','late'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Only provider or admin may perform provider-facing transitions
    if (!(req.user.role === 'provider' || req.user.role === 'admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    // push to statusHistory when status actually changes
    if (order.status !== status) {
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({ status, at: new Date(), by: req.user.id });
    }

    order.status = status;

    // Auto-create a Pickup record when order is confirmed (reserve a pickup slot)
    if (status === 'confirmed') {
      try {
        const Pickup = require('../models/Pickup');
        const scheduled = order.meta?.rentalStart ? new Date(order.meta.rentalStart) : new Date();
        // create only if not exists
        const existing = await Pickup.findOne({ order: order._id });
        if (!existing) {
          await Pickup.create({ order: order._id, provider: order.provider, scheduledAt: scheduled, meta: { createdBy: req.user.id } });
        }
      } catch (err) {
        console.warn('[orderController] pickup creation failed:', err?.message || err);
      }
    }

    await order.save();

    // Emit realtime event
    try {
      emitter.emit(`order:${order._id.toString()}`, { type: 'order.updated', order: order.toObject ? order.toObject() : order });
    } catch (e) { console.debug('[orderController] emit failed', e && e.message); }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// Provider marks an order as picked up (creates/updates Pickup and transitions order)
exports.markPickup = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.provider.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });

    const Pickup = require('../models/Pickup');
    let pickup = await Pickup.findOne({ order: order._id });
    if (!pickup) {
      pickup = await Pickup.create({ order: order._id, provider: order.provider, scheduledAt: order.meta?.rentalStart || new Date(), pickedAt: new Date() });
    } else {
      pickup.pickedAt = new Date();
      await pickup.save();
    }

    // Transition order
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status: 'picked_up', at: new Date(), by: req.user.id });
    order.status = 'picked_up';
    await order.save();

    // emit
    try { emitter.emit(`order:${order._id.toString()}`, { type: 'order.picked_up', order: order.toObject ? order.toObject() : order, pickup: pickup.toObject ? pickup.toObject() : pickup }); } catch (e) {}

    return res.status(200).json({ success: true, data: { order, pickup } });
  } catch (err) {
    next(err);
  }
};

// Provider marks an order as returned (calculates late-fee, restores stock, updates order)
exports.markReturn = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.provider.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });

    const returnedAt = req.body.returnedAt ? new Date(req.body.returnedAt) : new Date();
    const ReturnModel = require('../models/Return');

    // compute late fee
    let lateFee = 0;
    const rentalEnd = order.meta?.rentalEnd ? new Date(order.meta.rentalEnd) : null;
    const qty = Number(order.meta?.quantity ?? order.rental?.quantity ?? order.items?.[0]?.quantity ?? 1);
    const perDayRate = Number(order.items?.[0]?.price || order.totalAmount || 0);

    if (rentalEnd && returnedAt > rentalEnd) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysLate = Math.ceil((returnedAt - rentalEnd) / msPerDay);
      // fee policy: default 100% of daily rate per day if no explicit lateFee configured
      const productLatePerDay = Number(order.product?.lateFeePerDay || 0);
      if (productLatePerDay > 0) {
        lateFee = daysLate * productLatePerDay * qty;
      } else {
        // fallback: charge 100% of average daily rate per day
        const avgDaily = perDayRate || ((order.totalAmount || 0) / Math.max(1, (Math.ceil((new Date(order.meta?.rentalEnd || order.updatedAt) - new Date(order.meta?.rentalStart || order.updatedAt)) / (1000*60*60*24)) || 1)));
        lateFee = daysLate * avgDaily * qty;
      }
    }

    // create Return record
    const ret = await ReturnModel.create({ order: order._id, provider: order.provider, returnedAt, lateFee, meta: { reportedBy: req.user.id } });

    // restore stock (increment availableUnits) — best-effort
    try {
      const Product = require('../models/Product');
      const inc = {};
      inc['availableUnits'] = qty;
      await Product.findByIdAndUpdate(order.product._id || order.product, { $inc: inc });
    } catch (e) {
      console.warn('Failed to restore stock on return:', e?.message || e);
    }

    // update order financials & status
    order.financial = order.financial || {};
    order.financial.lateFee = (order.financial.lateFee || 0) + (lateFee || 0);
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status: 'returned', at: returnedAt, by: req.user.id });
    order.status = lateFee > 0 ? 'late' : 'returned';
    await order.save();

    // emit
    try { emitter.emit(`order:${order._id.toString()}`, { type: 'order.returned', order: order.toObject ? order.toObject() : order, return: ret.toObject ? ret.toObject() : ret }); } catch (e) {}

    return res.status(200).json({ success: true, data: { order, return: ret } });
  } catch (err) {
    next(err);
  }
};
