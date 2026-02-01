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
            let createdOrder = null;
            let createdInvoice = null;
            if (payment.rental) {
                const rental = await Rental.findById(payment.rental._id || payment.rental).populate('product user');
                if (rental) {
                    rental.payment = payment._id;
                    rental.paymentRequired = false;
                    const now = new Date();
                    if (rental.startDate <= now) {
                        rental.rentalStatus = 'active';
                    }
                    await rental.save();

                    // Ensure there's an Order for this rental so provider sees it
                    const Order = require('../models/Order');
                    const Product = require('../models/Product');
                    const User = require('../models/User');

                    // try to find existing order linked to this rental
                    let order = await Order.findOne({ rental: rental._id });
                    if (!order) {
                        const product = await Product.findById(rental.product._id || rental.product);
                        order = await Order.create({
                            renter: rental.user._id || rental.user,
                            provider: product.owner,
                            product: product._id,
                            rental: rental._id,
                        items: [{
                          productSnapshot: {
                            title: product.title,
                            id: product._id,
                            images: product.images || product.photos || []
                          },
                          quantity: rental.quantity || 1,
                          price: rental.totalCost
                        }],
                        totalAmount: rental.totalCost,
                        status: 'pending',
                        notes: 'Auto-created from rental payment',
                        meta: {
                          rentalStart: rental.startDate,
                          rentalEnd: rental.endDate,
                          quantity: rental.quantity || 1,
                          rentalId: rental._id
                        }
                    });
                    }
                    createdOrder = order;

                    // Create an invoice for the order if one doesn't exist
                    const Invoice = require('../models/Invoice');
                    let invoice = await Invoice.findOne({ order: order._id });
                    if (!invoice) {
                        const renterUser = await User.findById(order.renter);
                        const providerUser = await User.findById(order.provider);
                        invoice = await Invoice.create({
                            order: order._id,
                            amount: order.totalAmount,
                            status: 'issued',
                            issuedAt: new Date(),
                            meta: {
                                orderId: order._id.toString(),
                                customerName: renterUser?.name || null,
                                vendorName: providerUser?.name || null,
                                productName: rental.product?.title || (order.items?.[0]?.productSnapshot?.title) || null,
                                rentalStart: rental.startDate,
                                rentalEnd: rental.endDate,
                                quantity: rental.quantity || 1,
                                priceBreakdown: {
                                  rentalTotal: rental.totalCost
                                }
                            }
                        });
                    }
                    createdInvoice = invoice;

                    // Create a simple DB notification for provider
                    try {
                        const Notification = require('../models/Notification');
                        const providerUser = await User.findById(order.provider);
                        await Notification.create({
                            user: order.provider,
                            type: 'order_created',
                            message: `New order ${order._id} — invoice ${createdInvoice?._id || ''}`,
                            meta: { order: order._id, invoice: createdInvoice?._id }
                        });
                        // Also console-log so devs see the notification in logs
                        console.log('Notification created for provider', providerUser?._id);
                    } catch (nErr) {
                        console.warn('Failed to create notification:', nErr?.message || nErr);
                    }
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

            // Return payment and any auto-created order/invoice for client to act on
            return res.status(200).json({ success: true, data: { payment, order: createdOrder, invoice: createdInvoice } });
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
