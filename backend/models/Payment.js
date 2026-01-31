const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    rental: {
        type: mongoose.Schema.ObjectId,
        ref: 'Rental'
    },
    order: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order'
    },
    invoice: {
        type: mongoose.Schema.ObjectId,
        ref: 'Invoice'
    },
    renter: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    transactionDate: {
        type: Date
    },
    transactionId: {
        type: String
    },
    meta: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
