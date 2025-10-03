import express from 'express';
import { calculateFreight, createBooking, getBookings,getTrackingId,getBookingById } from '../../controllers/userController/calculaterAndBooking.js';
import { authenticateUser } from '../../middlewares/userAuthMiddleware.js';

const router = express.Router();

router.post('/calculate', calculateFreight);

router.post('/book', authenticateUser, createBooking);

router.get('/get-all-bookings', authenticateUser, getBookings);
router.get('/get-tracking-id', authenticateUser, getTrackingId);
router.get('/get-booking/:bookingId', authenticateUser, getBookingById);

export default router;
