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

router.route('/')
    .get(getProducts)
    .post(protect, authorize('provider','admin'), createProduct);

router.route('/:id')
    .get(getProduct)
    .put(protect, authorize('provider','admin'), ensureOwnership('Product','id'), updateProduct)
    .delete(protect, authorize('provider','admin'), ensureOwnership('Product','id'), deleteProduct);

module.exports = router;
