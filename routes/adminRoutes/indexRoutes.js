import express from 'express';
import adminAuthRoutes from './adminAuthRoutes.js';
import freightRoutes from './freightRateRoutes.js';

const router = express.Router();    
router.use('/auth', adminAuthRoutes);
router.use('/freight', freightRoutes);

export default router;