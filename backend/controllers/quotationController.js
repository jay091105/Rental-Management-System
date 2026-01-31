const Quotation = require('../models/Quotation');
const Product = require('../models/Product');

exports.createQuotation = async (req, res, next) => {
  try {
    const { productId, quantity = 1, notes } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Ensure renters can only request quotations for published, available items
    if (!product.published) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.availableUnits != null && Number(quantity) > product.availableUnits) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available units' });
    }

    const quote = await Quotation.create({
      requester: req.user.id,
      provider: product.owner,
      product: productId,
      quantity,
      notes
    });

    res.status(201).json({ success: true, data: quote });
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