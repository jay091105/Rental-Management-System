const Payment = require('../models/Payment');
const Rental = require('../models/Rental');

// @desc    Process payment (mock)
// @route   POST /api/payments
// @access  Private (Renter)
exports.processPayment = async (req, res, next) => {
    try {
        const { rentalId, amount, transactionId } = req.body;

        const rental = await Rental.findById(rentalId);

        if (!rental) {
            return res.status(404).json({ success: false, message: 'Rental not found' });
        }

        const payment = await Payment.create({
            rental: rentalId,
            amount,
            transactionId,
            paymentStatus: 'completed'
        });

        // Update rental status if payment is successful
        await Rental.findByIdAndUpdate(rentalId, { status: 'confirmed' });

        res.status(201).json({ success: true, data: payment });
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
