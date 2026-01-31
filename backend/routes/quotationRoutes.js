const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const quotationController = require('../controllers/quotationController');

router.use(protect);

router.post('/', quotationController.createQuotation);
router.get('/my', quotationController.getMyQuotations);
router.get('/provider', quotationController.getProviderQuotations);
router.patch('/:id/status', quotationController.updateStatus);

module.exports = router;