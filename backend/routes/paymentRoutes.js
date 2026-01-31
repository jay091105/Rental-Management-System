const express = require('express');
const {
    processPayment,
    getPaymentByRental
} = require('../controllers/paymentController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, processPayment);
router.get('/rental/:rentalId', protect, getPaymentByRental);

module.exports = router;
