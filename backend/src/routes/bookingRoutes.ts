import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, bookingController.createBooking);
router.get('/my-bookings', authenticate, bookingController.getUserBookings);
router.get('/vendor-bookings', authenticate, bookingController.getVendorBookings);
router.get('/gantt', authenticate, bookingController.getGanttData);
router.get('/reports', authenticate, bookingController.getReports);
router.get('/:id/invoice', authenticate, bookingController.downloadInvoice);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);
router.put('/:id/status', authenticate, bookingController.updateBookingStatus);
router.put('/:id/return', authenticate, bookingController.processReturn);

export default router;