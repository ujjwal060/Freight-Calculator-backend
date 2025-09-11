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
                        message: `This email ${email} and mobile number ${mobileNumber} are already registered. Please login or reset your password.`,
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
                const { otp, expiry } = generateOTP();
                existingUser.otp = otp;
                existingUser.otpExpiry = expiry;
                await existingUser.save();

                const { subject, body } = emailTamplates.otpVerification(name, otp);
                const otpSent = await sendEmail({ email, subject, body });
                if (!otpSent.success) {
                    return res.status(500).json({
                        status: 500,
                        message: otpSent.message,
                    });
                }

                return res.status(200).json({
                    status: 200,
                    message: "OTP re-sent. Please verify your account."
                });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const { otp, expiry } = generateOTP();

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

        const { subject, body } = emailTamplates.otpVerification(name, otp);
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

export { signup };