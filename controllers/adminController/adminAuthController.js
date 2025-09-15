import admin from "../../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { loadConfig } from "../../config/loadConfig.js";
import { emailTamplates } from "../../utils/emailTemplate.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { generateOTP } from "../../utils/genrateOTP.js";
const config = await loadConfig();

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                message: "Email and password are required"
            });
        }

        const adminUser = await admin.findOne({ email });
        if (!adminUser) {
            return res.status(404).json({
                status: 404,
                message: "Admin email is incorrect. Please check and try again."
            });
        }

        const isMatch = await bcrypt.compare(password, adminUser.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 401,
                message: "Invalid password. Please try again.",
            });
        }

        const token = jwt.sign(
            { id: adminUser._id },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
        );

        const refreshToken = jwt.sign(
            { id: adminUser._id },
            config.REFRESH_TOKEN_SECRET,
            { expiresIn: "30d" }
        );

        return res.status(200).json({
            status: 200,
            message: "Admin logged in successfully",
            admin: {
                id: adminUser._id,
                token,
                refreshToken,
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 400,
                message: "Please provide an email address to proceed.",
            });
        }

        const result = await admin.findOne({ email });
        if (!result) {
            return res.status(404).json({
                status: 404,
                message: "No admin account exists with this email address.",
            });
        }

        const { otp, expiry } = generateOTP();
        result.otp = otp;
        result.otpExpiry = expiry;
        await result.save();

        const { subject, body } = emailTamplates.forgotPasswordAdminOTP(otp);
        const otpSent = await sendEmail({ email, subject, body });

        if (!otpSent.success) {
            return res.status(500).json({
                status: 500,
                message: otpSent.message,
            });
        }

        return res.status(200).json({
            status: 200,
            message: "OTP has been sent to your Email.",
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                status: 400,
                message: "Email and OTP are required",
            });
        }

        const adminUser = await admin.findOne({ email });
        if (!adminUser) {
            return res.status(404).json({
                status: 404,
                message: "Admin account not found",
            });
        }

        if (adminUser.otp !== otp) {
            return res.status(400).json({
                status: 400,
                message: "Invalid OTP",
            });
        }

        const currentTime = new Date();
        if (adminUser.otpExpiry < currentTime) {
            return res.status(400).json({
                status: 400,
                message: "OTP has expired. Please request a new one.",
            });
        }

        adminUser.otp = undefined;
        adminUser.otpExpiry = undefined;
        await adminUser.save();

        const token = jwt.sign(
            { id: adminUser._id },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        return res.status(200).json({
            status: 200,
            message: "OTP verified successfully. You may now reset your password.",
            token,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}

const setPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                message: "Please provide email and password to proceed.",
            });
        }

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,12}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                status: 400,
                message:
                    "Password must be 6-12 characters long, contain at least one uppercase letter, one number, and one special character.",
            });
        }

        const adminUser = await admin.findOne({ email });
        const hashedPassword = await bcrypt.hash(password, 10);
        adminUser.password = hashedPassword;

        adminUser.otp = undefined;
        adminUser.otpExpiry = undefined;

        await adminUser.save();

        return res.status(200).json({
            status: 200,
            message: "Admin password has been set successfully.",
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}

const resendAdminOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 400,
                message: "Email is required",
            });
        }

        const adminUser = await admin.findOne({ email });
        if (!adminUser) {
            return res.status(404).json({
                status: 404,
                message: "Admin account not found",
            });
        }

        const { otp, expiry } = generateOTP();
        adminUser.otp = otp;
        adminUser.otpExpiry = expiry;
        await adminUser.save();

        const { subject, body } = emailTamplates.resendAdminOTP(otp);
        const otpSent = await sendEmail({ email, subject, body });

        if (!otpSent.success) {
            return res.status(500).json({
                status: 500,
                message: otpSent.message,
            });
        }

        return res.status(200).json({
            status: 200,
            message: "OTP has been resent to the registered admin email.",
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};

export { loginAdmin, forgotPassword, verifyOtp, setPassword, resendAdminOtp };