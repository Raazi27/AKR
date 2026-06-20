import express from 'express';
import TailoringOrder from '../models/TailoringOrder.js';
import Customer from '../models/Customer.js';
import { verifyToken, isTailor, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create Tailoring Order
router.post('/', async (req, res) => {
    try {
        const { customerId, measurements, items, deliveryDate, notes } = req.body;

        // Also update Customer measurements if changed
        if (measurements) {
            await Customer.findByIdAndUpdate(customerId, { measurements }, { new: true });
        }

        const order = new TailoringOrder({
            customerId,
            measurements,
            items,
            deliveryDate,
            notes,
            status: 'Pending'
        });

        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Update Order Status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await TailoringOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Get Orders (Pending by default or all)
router.get('/', verifyToken, async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = {};

        // If user is a customer, only show their orders
        if (req.user.role === 'customer') {
            // Find the customer profile linked to this user
            const customer = await Customer.findOne({ userId: req.user._id });
            if (!customer) {
                return res.json([]); // No customer profile found
            }
            query.customerId = customer._id;
        }

        if (status) query.status = status;
        // Date filtering logic (simplified)

        const orders = await TailoringOrder.find(query).populate('customerId').sort({ deliveryDate: 1 });
        res.json(orders);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

export default router;
