const Invoice = require('../models/Invoice');
const Order = require('../models/Order');

exports.createInvoice = async (req, res, next) => {
    try {
        const { orderId, dueDate } = req.body;
        if (!orderId) return res.status(400).json({ success: false, message: 'orderId is required' });

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Only provider or admin can create invoice
        if (order.provider.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to create invoice for this order' });
        }

        const invoice = await Invoice.create({ order: orderId, amount: order.totalAmount, status: 'issued', issuedAt: new Date(), dueDate });
        res.status(201).json({ success: true, data: invoice });
    } catch (err) {
        next(err);
    }
};

exports.getInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate('order');
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
        // Authorization: renter (via order) or provider or admin
        const order = invoice.order;
        if (order.renter.toString() !== req.user.id && order.provider.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
        }
        res.status(200).json({ success: true, data: invoice });
    } catch (err) {
        next(err);
    }
};

exports.getMyInvoices = async (req, res, next) => {
    try {
        // Return invoices where the requesting user is the renter OR the provider for the linked order.
        // Populate the order so we can authorize and filter in JS (keeps the query simple and clear).
        const invoices = await Invoice.find().populate('order');
        const filtered = invoices.filter(i => {
            if (!i.order) return false;
            const renterId = i.order.renter?.toString?.();
            const providerId = i.order.provider?.toString?.();
            return renterId === req.user.id || providerId === req.user.id;
        });
        res.status(200).json({ success: true, count: filtered.length, data: filtered });
    } catch (err) {
        next(err);
    }
};
