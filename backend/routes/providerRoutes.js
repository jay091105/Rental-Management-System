const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getProducts, getRentals } = require('../controllers/providerController');

const router = express.Router();

router.use(protect, authorize('provider','admin'));

router.get('/products', getProducts);
router.get('/rentals', getRentals);

module.exports = router;