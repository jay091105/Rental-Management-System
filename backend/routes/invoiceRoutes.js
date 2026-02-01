const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const invoiceController = require('../controllers/invoiceController');

router.use(protect);

router.post('/', invoiceController.createInvoice);
router.get('/my', invoiceController.getMyInvoices);
router.get('/:id', invoiceController.getInvoice);
// Download PDF (renter/vendor/admin only)
router.get('/:id/download', invoiceController.downloadInvoice);

module.exports = router;
