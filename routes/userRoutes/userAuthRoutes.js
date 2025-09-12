import express from 'express';
import { signup,verifyOtp,setPassword,forgotPassword,resendOtp,login,getUserProfile } from '../../controllers/userController/userAuth.js';
import { authenticateUser} from '../../middlewares/userAuthMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/set-password', authenticateUser, setPassword);
router.post('/forgot-password', forgotPassword);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.get('/profile/:id', authenticateUser, getUserProfile);

export default router;