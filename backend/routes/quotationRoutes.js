const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const quotationController = require('../controllers/quotationController');

router.use(protect);

router.post('/', quotationController.createQuotation);
router.get('/my', quotationController.getMyQuotations);
router.get('/provider', quotationController.getProviderQuotations);
router.get('/:id', quotationController.getQuotationById);
router.patch('/:id', quotationController.updateQuotation);
router.post('/:id/confirm', quotationController.confirmQuotation);
router.patch('/:id/status', quotationController.updateStatus);

module.exports = router;