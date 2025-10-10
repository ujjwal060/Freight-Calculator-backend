import express from 'express';
import { calculateFreight, createBooking, getBookings,
    getTrackingId,getBookingById,getAllSize,getAllType,
    getAllArrivalCountries, getAllArrivalPorts,
    getAllDepartureCountries, getAllDeparturePorts } from '../../controllers/userController/calculaterAndBooking.js';
import { authenticateUser } from '../../middlewares/userAuthMiddleware.js';

const router = express.Router();

router.post('/calculate', calculateFreight);

router.post('/book', authenticateUser, createBooking);

router.get('/get-all-bookings', authenticateUser, getBookings);
router.get('/get-tracking-id', authenticateUser, getTrackingId);
router.get('/get-booking/:bookingId', getBookingById);
router.get('/get-all-sizes', getAllSize);
router.get('/get-all-types', getAllType);
router.post('/get-all-arrival-countries', getAllArrivalCountries);
router.post('/get-all-arrival-ports', getAllArrivalPorts);
router.get('/get-all-departure-countries', getAllDepartureCountries);
router.get('/get-all-departure-ports/:country', getAllDeparturePorts);

export default router;
