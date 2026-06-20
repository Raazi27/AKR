import express from 'express';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Email Config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Twilio Config
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN)
    ? new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Mock Database (In production, use Redis or MongoDB)
const otpStore = {};

// Utility
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

/**
 * Route: Request OTP
 * Body: { "type": "email" or "mobile", "target": "user@mail.com" or "+123..." }
 */
router.post('/request-otp', async (req, res) => {
    const { type, target } = req.body;
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore[target] = { otp, expiresAt };

    try {
        if (type === 'email') {
            await transporter.sendMail({
                from: `"Al Kabah" <${process.env.EMAIL_USER}>`,
                to: target,
                subject: "Your OTP Code",
                text: `Your code is ${otp}. It expires in 5 minutes.`
            });
        } else if (type === 'mobile') {
            if (!twilioClient) throw new Error('Twilio not configured');
            await twilioClient.messages.create({
                body: `Your OTP is: ${otp}`,
                to: target,
                from: process.env.TWILIO_PHONE_NUMBER
            });
        } else {
            return res.status(400).json({ message: "Invalid type. Use 'email' or 'mobile'." });
        }

        res.status(200).json({ message: `OTP sent to ${target}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
});

/**
 * Route: Verify OTP
 * Body: { "target": "user@mail.com", "otp": "123456" }
 */
router.post('/verify-otp', (req, res) => {
    const { target, otp } = req.body;
    const record = otpStore[target];

    if (!record) {
        return res.status(404).json({ message: "No OTP found for this user." });
    }

    if (Date.now() > record.expiresAt) {
        delete otpStore[target];
        return res.status(400).json({ message: "OTP has expired." });
    }

    if (record.otp === otp) {
        delete otpStore[target];
        return res.status(200).json({ message: "OTP verified successfully!" });
    } else {
        return res.status(400).json({ message: "Invalid OTP code." });
    }
});

export default router;
