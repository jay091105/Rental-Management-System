const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

router.use(protect);

router.post('/', orderController.createOrder);
router.get('/my', orderController.getMyOrders);
router.get('/provider', orderController.getProviderOrders);
router.get('/:id/stream', orderController.streamOrder);
router.get('/:id', orderController.getOrder);
router.patch('/:id/status', orderController.updateStatus);

module.exports = router;
