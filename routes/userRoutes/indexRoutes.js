import express from 'express';
import userAuthRoutes from './userAuthRoutes.js';
import userCalcRoutes from './userCalcRoutes.js';

const router = express.Router();    
router.use('/auth', userAuthRoutes);
router.use('/freight', userCalcRoutes);

export default router;