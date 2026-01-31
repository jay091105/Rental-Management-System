const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required', code: 'INVALID_INPUT' });
        }

        const emailRe = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRe.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email address', code: 'INVALID_INPUT' });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters', code: 'INVALID_INPUT' });
        }

        const allowedRoles = ['renter', 'provider'];
        const assignedRole = role ? role : 'renter';
        if (!allowedRoles.includes(assignedRole)) {
            return res.status(400).json({ success: false, message: 'Invalid role provided', code: 'INVALID_INPUT' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: assignedRole
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        // Handle duplicate key (email) error
        if (err && err.code === 11000) {
            return res.status(409).json({ success: false, message: 'Email already exists', code: 'EMAIL_EXISTS' });
        }

        // Mongoose validation error
        if (err && err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: err.message, code: 'INVALID_INPUT' });
        }

        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password', code: 'INVALID_INPUT' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`[AUTH DEBUG] User not found: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        console.log(`[AUTH DEBUG] Password comparison result for ${email}: ${isMatch}`);

        if (!isMatch) {
            console.log(`[AUTH DEBUG] Password mismatch for: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};
