import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, bookingController.createBooking);
router.get('/my-bookings', authenticate, bookingController.getUserBookings);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

export default router;