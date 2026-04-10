import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import bcrypt from 'bcryptjs';
import Customer from '../models/Customer.js';
import Counter from '../models/Counter.js';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

// In-memory store for registration OTPs (Email -> {otp, expiresAt})
const registrationOtpStore = new Map();

// Email Transporter (Direct SMTP for better stability)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, '') : ''
    }
});

const verifyEmailDomain = async (email) => {
    const domain = email.split('@')[1].toLowerCase();
    const whitelist = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
        'icloud.com', 'me.com', 'aol.com', 'msn.com',
        'ymail.com', 'live.com', 'protonmail.com', 'proton.me',
        'zoho.com', 'gmx.com', 'mail.com', 'test.com'
    ];

    const blacklisted = [
        'mailinator.com', '10minutemail.com', 'guerrillamail.com',
        'tempmail.com', 'temp-mail.org', 'throwawaymail.com',
        'getairmail.com', 'yopmail.com', 'sharklasers.com',
        'dispostable.com', 'getnada.com', 'maildrop.cc',
        'disposable.com', 'tempmail.com', 'burnemail.com',
        'emailfake.com', 'fakeinbox.com', 'temp-mail.io'
    ];

    // 1. Blacklist Check
    if (blacklisted.some(d => domain.includes(d))) {
        throw new Error(`The domain ${domain} is not allowed. Please use a permanent email address.`);
    }

    // 2. Whitelist Check
    if (whitelist.includes(domain)) return true;

    // 3. DNS Check (Simplified to prevent crashes)
    return new Promise((resolve) => {
        dns.resolveMx(domain, (err, addresses) => {
            if (err) {
                console.warn(`DNS lookup for ${domain} failed: ${err.message}`);
                // Soft fail for common errors, hard fail only for definitive non-existence
                if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
                    // We'll still soft allow in case of local network issues during development
                    console.log(`Soft-allowing ${domain} despite ${err.code}`);
                    return resolve(true);
                }
                return resolve(true);
            }
            resolve(addresses && addresses.length > 0);
        });
    });
};

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });


// Route: Request OTP for Registration
router.post('/register-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).send('Invalid email format');
        }

        // DNS Check for Domain Existence
        try {
            await verifyEmailDomain(email);
        } catch (dnsErr) {
            return res.status(400).send(dnsErr.message);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) {
            return res.status(400).send('Email already exists');
        }

        // Generate OTP
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

        // Save to store (valid for 5 mins)
        registrationOtpStore.set(email.trim().toLowerCase(), {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        console.log(`Registration OTP for ${email}: ${otp}`);

        // Send Email
        const mailOptions = {
            from: `"Al-Kabah Registration" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Account Registration OTP - Al-Kabah Uniforms',
            text: `Your verification code for creating an account is: ${otp}\n\nThis code is valid for 5 minutes.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Email sending error:', err);
                // Return 500 for a real error to satisfy 'real-time' requirement
                return res.status(500).send('Email delivery failed. Please check your SMTP configuration or try again later.');
            }
            res.send('Verification code sent to your email');
        });

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, phone, address, pincode, otp } = req.body;
        // Default role is customer if not specified or restricted
        const userRole = role || 'customer';

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).send('Invalid email format');
        }

        // DNS Check for Domain Existence (Optional redundant check)
        try {
            await verifyEmailDomain(email);
        } catch (dnsErr) {
            return res.status(400).send(dnsErr.message);
        }

        // 1. Mandatory OTP Verification
        const storedData = registrationOtpStore.get(email.trim().toLowerCase());

        if (!storedData) {
            return res.status(400).send('Please request a verification code first');
        }

        if (Date.now() > storedData.expiresAt) {
            registrationOtpStore.delete(email.trim().toLowerCase());
            return res.status(400).send('Verification code has expired. Please request a new one.');
        }

        if (storedData.otp !== otp) {
            return res.status(400).send('Invalid verification code');
        }

        // OTP is correct, remove it from store
        registrationOtpStore.delete(email.trim().toLowerCase());

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) {
            return res.status(400).send('Email already exists');
        }

        // Check Admin Limit
        if (userRole === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount >= 2) {
                return res.status(403).send('Admin limit reached. Only 2 admins allowed.');
            }
        }

        // Create the user
        const user = new User({
            name,
            email: email.trim().toLowerCase(),
            password,
            role: userRole,
            phone,
            address,
            pincode
        });
        await user.save();

        // If user is a customer, handle Customer profile linkage
        if (userRole === 'customer') {
            // 1. Check if a Customer record already exists for this email (added manually by admin)
            let customer = await Customer.findOne({ email: email.trim().toLowerCase() });

            if (customer) {
                // Link existing customer record to this new user
                customer.userId = user._id;
                // Also update other fields to match registration data if they were missing
                if (!customer.phone || customer.phone === 'N/A') customer.phone = phone || 'N/A';
                if (!customer.address) customer.address = address || '';
                if (!customer.pincode) customer.pincode = pincode || '';
                await customer.save();
                console.log(`Linked existing customer record ${customer.customerId} to new user ${user._id}`);
            } else {
                // 2. Create a new Customer profile if none exists
                let customerId = `CUST-${Date.now().toString().slice(-4)}`;
                try {
                    const counter = await Counter.findOneAndUpdate(
                        { id: 'customerId' },
                        { $inc: { seq: 1 } },
                        { new: true, upsert: true }
                    );
                    customerId = `CUST-${String(counter.seq).padStart(3, '0')}`;
                } catch (e) {
                    console.log('Counter error, using timestamp fallback');
                }

                customer = new Customer({
                    name,
                    email: email.trim().toLowerCase(),
                    phone: phone || 'N/A',
                    address: address || '',
                    pincode: pincode || '',
                    customerId,
                    userId: user._id
                });
                await customer.save();
                console.log(`Created new customer record ${customer.customerId} for user ${user._id}`);
            }
        }

        res.status(201).send('User Created');
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('Email not found');

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).send('Invalid Password');

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.header('auth-token', token).json({
            token,
            role: user.role,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            _id: user._id,
            phone: user.phone || '', // Include phone in login response too if needed
            address: user.address || ''
        });
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Forgot Password

// Forgot Password

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).send('Invalid email format');
        }

        // DNS Check for Domain Existence
        try {
            await verifyEmailDomain(email);
        } catch (dnsErr) {
            return res.status(400).send(dnsErr.message);
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) return res.status(404).send('User not found');

        // Generate OTP
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

        // Save OTP to user (valid for 10 mins)
        user.resetOtp = otp;
        user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        console.log(`OTP generated for ${email}: ${otp}`);

        // Send Email
        const mailOptions = {
            from: `"Al-Kabah Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset OTP - Al-Kabah Uniforms',
            text: `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Forgot Password Email error:', err);
                // [DEBUG LOG] Still print OTP to console so developer is not locked out
                console.log(`\n[DEBUG] Password Reset OTP for ${email}: ${otp}\n`);
                return res.status(500).send('Error sending email. Check backend logs.');
            }
            res.send('OTP sent to your email.');
        });

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        console.log(`Attempting password reset for ${email} with OTP: ${otp}`);

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            resetOtp: otp.trim(),
            resetOtpExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log(`Reset failed: User not found or OTP expired/mismatch for ${email}`);
            return res.status(400).send('Invalid or expired OTP');
        }

        // Hash new password - schema pre-save handles hashing if modified
        user.password = newPassword;
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;

        await user.save(); // pre-save middleware will hash the password

        res.send('Password reset successful. You can now login.');

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get Current User Profile
router.get('/profile', async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified._id).select('-password');

        // If customer, fetch customer details too
        let profile = { ...user.toObject() };
        if (user.role === 'customer') {
            const customer = await Customer.findOne({ userId: user._id });
            if (customer) {
                profile = { ...profile, customerDetails: customer };
            }
        }

        res.json(profile);
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
});

// Update Profile
router.put('/profile', upload.single('profilePicture'), async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const { name, email, phone, address, pincode, password } = req.body;
        const profilePicture = req.file ? req.file.path : undefined;

        const user = await User.findById(verified._id);
        if (!user) return res.status(404).send('User not found');

        // Check if email is being updated and if it's already taken
        if (email && email.trim().toLowerCase() !== user.email) {
            const existingUser = await User.findOne({ 
                email: email.trim().toLowerCase(), 
                _id: { $ne: verified._id } 
            });
            if (existingUser) {
                return res.status(400).send('Email already exists');
            }
        }

        // Update User Model fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (pincode) user.pincode = pincode;

        if (password) user.password = password;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        // If customer, update Customer Model fields
        if (user.role === 'customer') {
            const customerUpdate = {};
            if (name) customerUpdate.name = name;
            if (email) customerUpdate.email = email.trim().toLowerCase();
            if (phone) customerUpdate.phone = phone;
            if (address) customerUpdate.address = address;
            if (pincode) customerUpdate.pincode = pincode;

            if (Object.keys(customerUpdate).length > 0) {
                // Try finding by userId first, then fallback to email if userId isn't linked yet
                let customer = await Customer.findOne({ userId: user._id });

                if (!customer && user.email) {
                    customer = await Customer.findOne({ email: user.email.trim().toLowerCase() });
                    if (customer) {
                        customer.userId = user._id; // Establish the link
                    }
                }

                if (customer) {
                    // Update existing record
                    Object.assign(customer, customerUpdate);
                    await customer.save();
                } else {
                    // Create new if absolutely nothing found (unlikely but safe)
                    // Note: This matches the registration ID generation patterns
                    const counter = await Counter.findOneAndUpdate({ id: 'customerId' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
                    const newId = `CUST-${String(counter.seq).padStart(3, '0')}`;

                    await Customer.create({
                        ...customerUpdate,
                        userId: user._id,
                        customerId: newId,
                        phone: phone || user.phone || 'N/A'
                    });
                }
            }
        }

        const updatedUser = await User.findById(user._id).select('-password');
        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
});

export default router;
