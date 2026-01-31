const express = require('express');
const {
    processPayment,
    getPaymentByRental,
    mockPayment
} = require('../controllers/paymentController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, processPayment);
router.post('/:id/mock', protect, mockPayment);
router.get('/rental/:rentalId', protect, getPaymentByRental);

module.exports = router;
