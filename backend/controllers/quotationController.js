const Quotation = require('../models/Quotation');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { reservedQuantity } = require('../utils/availability');

exports.createQuotation = async (req, res, next) => {
  try {
    const { productId, items, quantity = 1, notes, expiresAt } = req.body;
    // support legacy single-product payload
    if (!productId && !Array.isArray(items)) return res.status(400).json({ success: false, message: 'productId or items is required' });

    const product = productId ? await Product.findById(productId) : null;
    if (productId && !product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Build items array (normalize legacy shape)
    const normItems = Array.isArray(items)
      ? items
      : [{ product: productId, quantity, rentalStart: req.body.rentalStart, rentalEnd: req.body.rentalEnd, pricePerUnit: product?.pricePerDay || product?.price }];

    // basic availability pre-check
    for (const it of normItems) {
      const p = await Product.findById(it.product);
      if (!p || !p.published) return res.status(404).json({ success: false, message: 'Product not found' });
      if (p.availableUnits != null && Number(it.quantity) > p.availableUnits) {
        return res.status(400).json({ success: false, message: 'Requested quantity exceeds available units' });
      }
    }

    // compute total
    let total = 0;
    normItems.forEach(i => { total += (Number(i.pricePerUnit || 0) * Number(i.quantity || 1)); });

    const quote = await Quotation.create({
      requester: req.user.id,
      provider: product ? product.owner : (normItems[0] && (await Product.findById(normItems[0].product)).owner),
      items: normItems,
      totalAmount: total,
      notes,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      status: 'draft'
    });

    res.status(201).json({ success: true, data: quote });
  } catch (err) {
    next(err);
  }
};

// get single quotation
exports.getQuotationById = async (req, res, next) => {
  try {
    const q = await Quotation.findById(req.params.id).populate('items.product provider requester');
    if (!q) return res.status(404).json({ success: false, message: 'Quotation not found' });
    // authorize: requester, provider or admin
    if (q.requester.toString() !== req.user.id && q.provider?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this quotation' });
    }
    res.status(200).json({ success: true, data: q });
  } catch (err) {
    next(err);
  }
};

// update quotation (drafts)
exports.updateQuotation = async (req, res, next) => {
  try {
    const q = await Quotation.findById(req.params.id);
    if (!q) return res.status(404).json({ success: false, message: 'Quotation not found' });
    if (q.requester.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    // allow updating items/notes/expiresAt when draft
    if (q.status !== 'draft') return res.status(400).json({ success: false, message: 'Only draft quotations can be edited' });
    const { items, notes, expiresAt } = req.body;
    if (items) q.items = items;
    if (notes) q.notes = notes;
    if (expiresAt) q.expiresAt = new Date(expiresAt);
    // recompute total
    q.totalAmount = (q.items || []).reduce((s, it) => s + ((it.pricePerUnit || 0) * (it.quantity || 1)), 0);
    await q.save();
    res.status(200).json({ success: true, data: q });
  } catch (err) {
    next(err);
  }
};

// Confirm a quotation: validate availability (DB-level), create Order, reserve stock
exports.confirmQuotation = async (req, res, next) => {
  try {
    const quote = await Quotation.findById(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found' });

    // only requester or provider (depending on flow) can confirm — for now requester confirms
    if (quote.requester.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to confirm this quotation' });
    }

    if (quote.status === 'confirmed') {
      return res.status(200).json({ success: true, data: await Order.findOne({ 'meta.quotationId': quote._id }) });
    }

    // validate availability per item
    for (const it of quote.items) {
      if (it.rentalStart && it.rentalEnd) {
        const reserved = await reservedQuantity(it.product, it.rentalStart, it.rentalEnd);
        const prod = await Product.findById(it.product).select('availableUnits');
        const avail = Number(prod?.availableUnits || 0) - Number(reserved || 0);
        if (Number(it.quantity) > avail) {
          return res.status(400).json({ success: false, message: `Insufficient availability for product ${it.product}` });
        }
      }
    }

    // create Order (one order per quotation for now)
    const first = quote.items[0];
    const order = await Order.create({
      renter: quote.requester,
      provider: quote.provider,
      product: first.product,
      items: quote.items.map(i => ({ productSnapshot: { id: i.product }, quantity: i.quantity, price: i.pricePerUnit })),
      totalAmount: quote.totalAmount,
      status: 'pending',
      meta: { quotationId: quote._id, items: quote.items }
    });

    quote.status = 'confirmed';
    await quote.save();

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.getMyQuotations = async (req, res, next) => {
  try {
    const quotes = await Quotation.find({ requester: req.user.id }).populate('product provider');
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
  } catch (err) {
    next(err);
  }
};

exports.getProviderQuotations = async (req, res, next) => {
  try {
    const quotes = await Quotation.find({ provider: req.user.id }).populate('product requester');
    res.status(200).json({ success: true, count: quotes.length, data: quotes });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const quote = await Quotation.findById(req.params.id);
    if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found' });
    const { status } = req.body;
    if (!['requested','draft','accepted','rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    // only provider or admin
    if (req.user.role === 'provider' || req.user.role === 'admin') {
      quote.status = status;
      await quote.save();
      return res.status(200).json({ success: true, data: quote });
    }
    return res.status(403).json({ success: false, message: 'Not authorized to update this quotation' });
  } catch (err) {
    next(err);
  }
};