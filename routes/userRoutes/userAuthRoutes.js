import express from 'express';
import { signup,verifyOtp,setPassword,forgotPassword,resendOtp,login,getUserProfile } from '../../controllers/userController/userAuth.js';
import { authenticateUser,refreshToken} from '../../middlewares/userAuthMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/set-password', authenticateUser, setPassword);
router.post('/forgot-password', forgotPassword);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.get('/profile/:id', authenticateUser, getUserProfile);
router.post('/refresh-token', refreshToken);

export default router;