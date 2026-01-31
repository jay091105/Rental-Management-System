const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
    try {
        const { productId, rating, comment } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const review = await Review.create({
            product: productId,
            user: req.user.id,
            rating,
            comment
        });

        // Update average rating and num of reviews
        const reviews = await Review.find({ product: productId });
        const numOfReviews = reviews.length;
        const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;

        await Product.findByIdAndUpdate(productId, {
            averageRating,
            numOfReviews
        });

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).populate({
            path: 'user',
            select: 'name'
        });

        res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
