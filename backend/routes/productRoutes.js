const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const ensureOwnership = require('../middleware/ownership');

const { optionalAuth } = require('../middleware/auth');

router.route('/')
    .get(optionalAuth, getProducts)
    .post(protect, authorize('provider','admin'), createProduct);

router.route('/:id/availability')
  .get(optionalAuth, require('../controllers/productController').getAvailability);

router.route('/:id')
    .get(optionalAuth, getProduct)
    .put(protect, authorize('provider','admin'), ensureOwnership('Product','id'), updateProduct)
    .delete(protect, authorize('provider','admin'), ensureOwnership('Product','id'), deleteProduct);

module.exports = router;
