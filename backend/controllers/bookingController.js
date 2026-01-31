const Booking = require('../models/Booking');
const Property = require('../models/Property');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private (Tenant, Admin)
exports.createBooking = async (req, res, next) => {
    try {
        const { propertyId, startDate, endDate } = req.body;

        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        if (!property.isAvailable) {
            return res.status(400).json({ success: false, message: 'Property is currently not available for booking' });
        }

        // Check if there are overlapping bookings (Simplified availability check)
        const overlappingBooking = await Booking.findOne({
            property: propertyId,
            status: 'confirmed',
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        if (overlappingBooking) {
            return res.status(400).json({ success: false, message: 'Property is already booked for these dates' });
        }

        // Calculate total amount (Simplified: rent * months/days)
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const totalAmount = (property.rent / 30) * diffDays;

        const booking = await Booking.create({
            property: propertyId,
            user: req.user.id,
            startDate,
            endDate,
            totalAmount: Math.round(totalAmount)
        });

        res.status(201).json({ success: true, data: booking });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin)
exports.getBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find().populate('property user', 'title name email');
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate('property', 'title location rent');
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private (Admin, Owner)
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        let booking = await Booking.findById(req.params.id).populate('property');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Only Admin or Property Owner can update status
        if (booking.property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this booking' });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, { status }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
