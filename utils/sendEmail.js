import nodemailer from 'nodemailer';
import { loadConfig } from '../config/loadConfig.js';

const sendEmail = async ({ email, subject, body }) => {
    try {
        const config = await loadConfig();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASS
            }
        });

        const mailOptions = {
            from:  `"Freight Calculator" <${config.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: body
        };

        await transporter.sendMail(mailOptions);
        logger.info(`OTP sent successfully to ${email}`);
        return { success: true };
    } catch (error) {
        logger.error(`Failed to send OTP to ${email}. Error: ${error}`);
        return { success: false, message: [error.message] };
    }
};

export { sendEmail };