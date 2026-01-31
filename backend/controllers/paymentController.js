const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Process payment (mock)
// @route   POST /api/payments
// @access  Private (Tenant)
exports.processPayment = async (req, res, next) => {
    try {
        const { bookingId, amount, transactionId } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const payment = await Payment.create({
            booking: bookingId,
            amount,
            transactionId,
            paymentStatus: 'completed'
        });

        // Update booking status if payment is successful
        await Booking.findByIdAndUpdate(bookingId, { status: 'confirmed' });

        res.status(201).json({ success: true, data: payment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get payment by booking ID
// @route   GET /api/payments/booking/:bookingId
// @access  Private
exports.getPaymentByBooking = async (req, res, next) => {
    try {
        const payment = await Payment.findOne({ booking: req.params.bookingId });

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
