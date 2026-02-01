const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getProducts, getRentals, deactivateProvider, reactivateProvider, deleteProvider } = require('../controllers/providerController');

const router = express.Router();

router.use(protect, authorize('provider','admin'));

router.get('/products', getProducts);
router.get('/rentals', getRentals);

// Provider lifecycle endpoints
router.patch('/:id/deactivate', deactivateProvider);
router.patch('/:id/reactivate', reactivateProvider);
router.delete('/:id', deleteProvider);

module.exports = router;