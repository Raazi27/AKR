import express from 'express';
import Customer from '../models/Customer.js';
import Counter from '../models/Counter.js';
import User from '../models/User.js';
import { verifyToken, isBilling, isAdmin } from '../middleware/auth.js';
import bwipjs from 'bwip-js';

const router = express.Router();

// Add Customer
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, address, measurements } = req.body;

        // Generate Customer ID
        const counter = await Counter.findOneAndUpdate({ id: 'customer' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        const customerId = 'CUST' + counter.seq.toString().padStart(4, '0');
        const barcode = customerId;

        // Check if a User with this email already exists
        let userId = undefined;
        if (email) {
            const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
            if (existingUser) {
                userId = existingUser._id;
            }
        }

        const customer = new Customer({
            customerId,
            barcode,
            name,
            phone,
            email: email ? email.trim().toLowerCase() : undefined,
            address,
            measurements,
            userId
        });
        await customer.save();

        if (userId) {
            console.log(`Linked new customer ${customerId} to existing user ${userId}`);
        }

        res.status(201).json(customer);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Update Customer (or Measurements)
router.put('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!customer) return res.status(404).send('Customer not found');
        res.json(customer);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Get Customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Search Customer
router.get('/search', async (req, res) => {
    const { query } = req.query;
    try {
        const customers = await Customer.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } },
                { customerId: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(customers);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Generate Barcode Image
router.get('/:id/barcode', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).send('Customer not found');

        bwipjs.toBuffer({
            bcid: 'code128',       // Barcode type
            text: customer.barcode || customer.customerId, // Text to encode
            scale: 3,               // 3x scaling factor
            height: 10,              // Bar height, in millimeters
            includetext: true,            // Show human-readable text
            textxalign: 'center',        // Always good to set this
        }, function (err, png) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.set('Content-Type', 'image/png');
                res.send(png);
            }
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default router;
