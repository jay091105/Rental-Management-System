const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res, next) => {
    try {
        const { productId, quantity = 1, rentalId, notes } = req.body;
        if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const order = await Order.create({
            renter: req.user.id,
            provider: product.owner,
            product: productId,
            rental: rentalId,
            items: [{ productSnapshot: { title: product.title, id: product._id }, quantity, price: product.price || product.pricePerDay || 0 }],
            totalAmount: (product.price || product.pricePerDay || 0) * quantity,
            notes
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
        res.status(200).json({ success: true, data: order });
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
        const orders = await Order.find({ provider: req.user.id }).populate('product renter');
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        next(err);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        const { status } = req.body;
        if (!['pending','confirmed','cancelled','completed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        // Only provider or admin can confirm/cancel
        if (req.user.role === 'provider' || req.user.role === 'admin') {
            order.status = status;
            await order.save();
            return res.status(200).json({ success: true, data: order });
        }
        return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    } catch (err) {
        next(err);
    }
};
