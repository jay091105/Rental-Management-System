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
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    // Legacy price (kept for backward compatibility)
    price: {
        type: Number,
        min: [0, 'Price cannot be negative'],
        default: null
    },
    // Preferred pricing fields
    pricePerHour: {
        type: Number,
        min: [0, 'pricePerHour cannot be negative'],
        default: null
    },
    pricePerDay: {
        type: Number,
        min: [0, 'pricePerDay cannot be negative'],
        default: null
    },
    pricePerMonth: {
        type: Number,
        min: [0, 'pricePerMonth cannot be negative'],
        default: null
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
    photos: {
        type: [String],
        default: []
    },
    brandName: {
        type: String,
        trim: true,
        default: ''
    },
    colour: {
        type: String,
        trim: true,
        default: ''
    },
    availableUnits: {
        type: Number,
        default: 1,
        min: [0, 'availableUnits cannot be negative']
    },
    deliveryCharges: {
        type: Number,
        default: 0,
        min: [0, 'deliveryCharges cannot be negative']
    },
    deposit: {
        type: Number,
        default: 0,
        min: [0, 'deposit cannot be negative']
    },
    published: {
        type: Boolean,
        default: false
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
