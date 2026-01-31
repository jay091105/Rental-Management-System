const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    rental: {
        type: mongoose.Schema.ObjectId,
        ref: 'Rental',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    transactionId: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
