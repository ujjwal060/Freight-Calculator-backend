import express from 'express';
import userAuthRoutes from './userAuthRoutes.js';

const router = express.Router();    
router.use('/auth', userAuthRoutes);

export default router;