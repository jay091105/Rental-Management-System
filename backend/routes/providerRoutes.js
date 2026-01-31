const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getProperties, getRentals } = require('../controllers/providerController');

const router = express.Router();

router.use(protect, authorize('provider','admin'));

router.get('/properties', getProperties);
router.get('/rentals', getRentals);

module.exports = router;