const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Add a review (only after completed rental)
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
    try {
        const { productId, rating, comment } = req.body;

        if (!productId || !rating || !comment) {
            return res.status(400).json({ success: false, message: 'productId, rating and comment are required' });
        }

        // Ensure user has a completed rental for this product
        const completedRental = await require('../models/Rental').findOne({ product: productId, user: req.user.id, rentalStatus: 'completed' });
        if (!completedRental) {
            return res.status(403).json({ success: false, message: 'You can only review a product after completing a rental' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Prevent duplicate review by the same user for the same product
        const existing = await Review.findOne({ product: productId, user: req.user.id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
        }

        const review = await Review.create({
            product: productId,
            user: req.user.id,
            rating,
            comment
        });

        // Update average rating and num of reviews
        const stats = await Review.aggregate([
            { $match: { product: require('mongoose').Types.ObjectId(productId) } },
            { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        const agg = stats[0] || { avgRating: 0, count: 0 };

        await Product.findByIdAndUpdate(productId, {
            averageRating: agg.avgRating || 0,
            numOfReviews: agg.count || 0
        });

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ success: false, message: 'Duplicate review' });
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
