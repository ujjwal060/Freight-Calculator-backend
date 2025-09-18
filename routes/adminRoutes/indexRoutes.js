import express from 'express';
import adminAuthRoutes from './adminAuthRoutes.js';
import freightRoutes from './freightRateRoutes.js';
import userRoutes from './userRoutes.js';
import bookingRoutes from "./bookingRoutes.js";

const router = express.Router();    
router.use('/auth', adminAuthRoutes);
router.use('/freight', freightRoutes);
router.use('/user', userRoutes);
router.use('/booking', bookingRoutes);

export default router;