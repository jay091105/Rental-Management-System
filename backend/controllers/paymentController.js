const Payment = require('../models/Payment');
const Rental = require('../models/Rental');

// @desc    Initiate or get payment for an approved rental
// @route   POST /api/payments
// @access  Private (Renter)
exports.processPayment = async (req, res, next) => {
    try {
        const { rentalId, invoiceId, orderId } = req.body;

        // If invoiceId provided, create a payment for invoice
        if (invoiceId) {
            const Invoice = require('../models/Invoice');
            const invoiceDoc = await Invoice.findById(invoiceId);
            if (!invoiceDoc) return res.status(404).json({ success: false, message: 'Invoice not found' });
            if (typeof invoiceDoc.populate === 'function') await invoiceDoc.populate({ path: 'order' });

            const invoice = invoiceDoc;

            // Ensure user is the renter for the underlying order
            const order = invoice.order;
            if (!order) return res.status(400).json({ success: false, message: 'Invoice has no order attached' });

            if (order.renter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Not authorized to pay for this invoice' });
            }

            let payment = await Payment.findOne({ invoice: invoice._id });
            if (payment) return res.status(200).json({ success: true, data: payment });

            payment = await Payment.create({
                invoice: invoice._id,
                order: order._id,
                renter: order.renter,
                provider: order.provider,
                amount: invoice.amount,
                status: 'pending'
            });

            return res.status(201).json({ success: true, data: payment });
        }

        // If orderId provided, create a payment for order (convenience)
        if (orderId) {
            const Order = require('../models/Order');
            const order = await Order.findById(orderId);
            if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

            if (order.renter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Not authorized to pay for this order' });
            }

            let payment = await Payment.findOne({ order: order._id });
            if (payment) return res.status(200).json({ success: true, data: payment });

            payment = await Payment.create({
                order: order._id,
                renter: order.renter,
                provider: order.provider,
                amount: order.totalAmount,
                status: 'pending'
            });

            return res.status(201).json({ success: true, data: payment });
        }

        // Default: rental flow
        if (!rentalId) return res.status(400).json({ success: false, message: 'rentalId is required' });

        // Use safe populate: Rental.findById may return a populated document or a query
        const rentalDoc = await Rental.findById(rentalId);
        if (!rentalDoc) return res.status(404).json({ success: false, message: 'Rental not found' });
        if (typeof rentalDoc.populate === 'function') await rentalDoc.populate('product');
        const rental = rentalDoc;

        if (rental.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to pay for this rental' });
        }

        if (rental.rentalStatus !== 'approved') {
            return res.status(400).json({ success: false, message: 'Rental must be approved before payment' });
        }

        let payment = await Payment.findOne({ rental: rental._id });
        if (payment) return res.status(200).json({ success: true, data: payment });

        payment = await Payment.create({
            rental: rental._id,
            renter: rental.user,
            provider: rental.product.owner,
            amount: rental.totalCost,
            status: 'pending'
        });

        rental.payment = payment._id;
        rental.paymentRequired = true;
        await rental.save();

        res.status(201).json({ success: true, data: payment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Mock payment outcome for testing
// @route   POST /api/payments/:id/mock
// @access  Private (Renter or Admin)
exports.mockPayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { outcome } = req.body; // 'success' or 'failure'

        const payment = await Payment.findById(id).populate('rental');
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

        if (payment.renter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (outcome === 'success') {
            payment.status = 'paid';
            payment.transactionDate = new Date();
            payment.transactionId = `mock_${Date.now()}`;
            await payment.save();

            // Update rental state
            if (payment.rental) {
                const rental = await Rental.findById(payment.rental._id || payment.rental).populate('product');
                if (rental) {
                    rental.payment = payment._id;
                    rental.paymentRequired = false;
                    const now = new Date();
                    if (rental.startDate <= now) {
                        rental.rentalStatus = 'active';
                    }
                    await rental.save();
                }
            }

            // If payment is for invoice/order -> update invoice status
            if (payment.invoice) {
                const Invoice = require('../models/Invoice');
                const invoice = await Invoice.findById(payment.invoice);
                if (invoice) {
                    invoice.status = 'paid';
                    await invoice.save();
                }
            }

            return res.status(200).json({ success: true, data: payment });
        }

        payment.status = 'failed';
        await payment.save();
        return res.status(200).json({ success: true, data: payment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get payment by rental ID
// @route   GET /api/payments/rental/:rentalId
// @access  Private
exports.getPaymentByRental = async (req, res, next) => {
    try {
        const payment = await Payment.findOne({ rental: req.params.rentalId });

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
