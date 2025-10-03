import userModel from '../../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../utils/sendEmail.js';
import { loadConfig } from '../../config/loadConfig.js';
import { generateOTP } from '../../utils/genrateOTP.js';
import { emailTamplates } from '../../utils/emailTemplate.js';
const config = await loadConfig();

const signup = async (req, res) => {
    try {
        const { name, email, mobileNumber, password } = req.body;
        const fields = [
            { key: "name", value: name },
            { key: "email", value: email },
            { key: "mobileNumber", value: mobileNumber },
            { key: "password", value: password },
        ];

        const missing = fields.find(f => !f.value);

        if (missing) {
            return res.status(400).json({
                status: 400,
                message: `${missing.key} field is required`
            });
        }

        const existingUser = await userModel.findOne({ $or: [{ email }, { mobileNumber }] });

        if (existingUser) {
            if (existingUser.isVerified) {
                if (existingUser.email === email && existingUser.mobileNumber === mobileNumber) {
                    return res.status(400).json({
                        status: 400,
                        message: `This email ${email} is already registered. Please login or reset your password.`,
                    });
                } else if (existingUser.email === email) {
                    return res.status(400).json({
                        status: 400,
                        message: `This email ${email} is already registered. Please login or reset your password.`,
                    });
                } else if (existingUser.mobileNumber === mobileNumber) {
                    return res.status(400).json({
                        status: 400,
                        message: `This mobile number ${mobileNumber} is already registered. Please login or reset your password.`,
                    });
                }
            } else {
                return res.status(400).json({
                    status: 400,
                    message: "User already exists but not verified. Please check your email to verify."
                });
            }
        }

        const { otp, expiry } = generateOTP();

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            name,
            email,
            mobileNumber,
            password: hashedPassword,
            otp,
            otpExpiry: expiry,
            isVerified: false
        });
        await newUser.save();

        const { subject, body } = emailTamplates.signupOTP(name, otp);
        const otpSent = await sendEmail({ email, subject, body });

        if (!otpSent.success) {
            return res.status(500).json({
                status: 500,
                message: otpSent.message,
            });
        }
        res.status(201).json({
            status: 201,
            message: "User registered successfully. Please verify your email."
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
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

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                status: 400,
                message: "Invalid OTP"
            });
        }

        const currentTime = new Date();
        if (user.otpExpiry < currentTime) {
            return res.status(400).json({
                status: 400,
                message: "OTP has expired. Please request a new one."
            });
        }

        user.otp = undefined;
        user.otpExpiry = undefined;

        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();

            return res.status(200).json({
                status: 200,
                message: "Email verified successfully. You can now login.",
                data: user
            });
        } else {
            await user.save();

            const resetToken = jwt.sign(
                { id: user._id, action: "resetPassword" },
                config.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            return res.status(200).json({
                status: 200,
                message: "OTP verified successfully. You can now reset your password.",
                token:resetToken
            });
        }

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};

const setPassword = async (req, res) => {
    try {
        const { password, email } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                message: "Please provide email and password to proceed.",
            });
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,12}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                status: 400,
                message: "Password must be 6-12 characters long, contain at least one uppercase letter, one number, and one special character.",
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            status: 200,
            message: "Your password has been set successfully.",
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 400,
                message: "Please provide a valid email address to proceed.",
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "Account not found with the provided email. Please check the email and try again.",
            });
        }

        const { otp, expiry } = generateOTP();
        user.otp = otp;
        user.otpExpiry = expiry;
        await user.save();

        const { subject, body } = emailTamplates.forgotPasswordOTP(user.name, otp);
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

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 400,
                message: "Email is required",
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
            });
        }

        const { otp, expiry } = generateOTP();
        user.otp = otp;
        user.otpExpiry = expiry;

        await user.save();

        const type = user.isVerified ? "forgotPassword" : "signup";
        const { subject, body } = emailTamplates.resendOTP(user.name, otp, type);
        const otpSent = await sendEmail({ email, subject, body });

        if (!otpSent.success) {
            return res.status(500).json({
                status: 500,
                message: otpSent.message,
            });
        }

        return res.status(200).json({
            status: 200,
            message: "OTP resent successfully",
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}

const changePassword = async (req, res) => {
    try{
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                status: 400,
                message: "Old password and new password are required",
            });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
            });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 401,
                message: "The old password you entered is incorrect. Please check and try again.",
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({
            status: 200,
            message: "Password changed successfully",
        });

    }catch(error){
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                message: "Email and password are required",
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found with the provided email or mobile. Please check the details and try again.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 401,
                message: "The password you entered is incorrect. Please check and try again.",
            });
        }

        const accessToken = jwt.sign(
            { userid: user._id },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            config.REFRESH_TOKEN_SECRET,
            { expiresIn: "30d" }
        );
        const token = { accessToken, refreshToken };
        return res.status(200).json({
            status: 200,
            message: "Login successful",
            token,
            userId: user._id,
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}

const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel.findById(userId).select('-password -otp -otpExpiry -__v -createdAt -updatedAt -isVerified');

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
            });
        }
        return res.status(200).json({
            status: 200,
            message: "User profile fetched successfully",
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}

const editUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, mobileNumber } = req.body;

        if (!name && !mobileNumber) {
            return res.status(400).json({
                status: 400,
                message: "Please provide at least one field to update (name or mobileNumber)",
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found",
            });
        }

        if (name) user.name = name;
        if (mobileNumber) user.mobileNumber = mobileNumber;
        await user.save();

        return res.status(200).json({
            status: 200,
            message: "User profile updated successfully",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};


export { signup, verifyOtp, setPassword, forgotPassword, resendOtp, login, getUserProfile, editUserProfile };