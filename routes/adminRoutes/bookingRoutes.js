import express from 'express';
import {getAllBookings,getAllBookingCounts,updateBookingStatus} from "../../controllers/adminController/bookingController.js";
import { authenticateUser }from "../../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post('/list', authenticateUser, getAllBookings);
router.get('/counts', authenticateUser, getAllBookingCounts);
router.put('/status/:bookingId', authenticateUser, updateBookingStatus);


export default router;