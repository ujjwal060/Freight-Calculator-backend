import express from 'express';
import {
    loginAdmin,
    forgotPassword,
    verifyOtp,
    setPassword,
    resendAdminOtp
} from "../../controllers/adminController/adminAuthController.js";
import {authenticateUser,refreshToken} from "../../middlewares/adminAuthMiddleware.js";
const router = express.Router();

router.post('/login', loginAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/set-password', authenticateUser, setPassword);
router.post('/resend-otp',resendAdminOtp);
router.post('/refresh-token',refreshToken);

export default router;