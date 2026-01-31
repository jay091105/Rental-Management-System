const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createRental,
  getMyRentals,
  getAllRentals,
  updateStatus
} = require('../controllers/rentalController');

// Create a rental (renter/provider authenticated)
router.post('/', protect, createRental);

// Get current user's rentals
router.get('/my', protect, getMyRentals);

// Get all rentals (protected)
router.get('/', protect, getAllRentals);

// Update rental status (provider/admin or renter for cancels)
router.patch('/:id/status', protect, updateStatus);

// Minimal cron endpoint to advance statuses (admin only)
router.post('/cron/advance', protect, authorize('admin'), require('../controllers/rentalController').advanceStatuses);

module.exports = router;
