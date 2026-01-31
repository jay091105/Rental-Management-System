const express = require('express');
const {
    addReview,
    getProductReviews
} = require('../controllers/reviewController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, addReview);
router.get('/product/:productId', getProductReviews);

module.exports = router;
