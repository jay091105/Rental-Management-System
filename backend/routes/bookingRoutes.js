const express = require('express');
const {
    createBooking,
    getBookings,
    getMyBookings,
    updateBookingStatus
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin'), getBookings)
    .post(protect, authorize('tenant', 'admin'), createBooking);

router.get('/my-bookings', protect, getMyBookings);

router.put('/:id', protect, authorize('owner', 'admin'), updateBookingStatus);

module.exports = router;
