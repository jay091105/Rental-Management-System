const express = require('express');
const {
    processPayment,
    getPaymentByBooking
} = require('../controllers/paymentController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, processPayment);
router.get('/booking/:bookingId', protect, getPaymentByBooking);

module.exports = router;
