const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: [
            'Real Estate',
            'Vehicles',
            'Equipment & Tools',
            'Electronics',
            'Events & Party',
            'Furniture',
            'Fashion',
            'Sports & Outdoors',
            'Other'
        ]
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    images: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['available', 'rented'],
        default: 'available'
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
