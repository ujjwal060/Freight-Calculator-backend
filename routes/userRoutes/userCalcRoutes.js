import express from 'express';
import { calculateFreight, createBooking, getBookings } from '../../controllers/userController/calculaterAndBooking.js';
import { authenticateUser } from '../../middlewares/userAuthMiddleware.js';

const router = express.Router();

// Calculate price (no auth needed for preview)
router.post('/calculate', calculateFreight);

// Create booking (auth recommended)
router.post('/book', authenticateUser, createBooking);

// Get current user's bookings
router.get('/get-all-bookings', authenticateUser, getBookings);

export default router;


