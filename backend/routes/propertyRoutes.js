const express = require('express');
const {
    getProperties,
    getProperty,
    addProperty,
    updateProperty,
    deleteProperty
} = require('../controllers/propertyController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getProperties)
    .post(protect, authorize('owner', 'admin'), addProperty);

router.route('/:id')
    .get(getProperty)
    .put(protect, authorize('owner', 'admin'), updateProperty)
    .delete(protect, authorize('owner', 'admin'), deleteProperty);

module.exports = router;
