import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getUserOrders);
router.get('/vendor-orders', authenticate, orderController.getVendorOrders);
router.get('/:id', authenticate, orderController.getOrderById);

export default router;
