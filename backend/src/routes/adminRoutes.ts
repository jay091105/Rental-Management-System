import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize(['ADMIN']));

router.get('/analytics', adminController.getAnalytics);
router.get('/bookings', adminController.getAllBookings);

export default router;