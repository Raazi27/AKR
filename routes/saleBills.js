import express from 'express';
import SaleBill from '../models/SaleBill.js';
import Product from '../models/Product.js';
import Counter from '../models/Counter.js';
import Customer from '../models/Customer.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create Sale Bill (5% GST auto-calculated)
router.post('/', verifyToken, async (req, res) => {
    console.log('[DEBUG] POST /api/sale-bills body:', JSON.stringify(req.body, null, 2));
    try {
        const { customerName, customerPhone, items, paymentMethod, status, notes } = req.body;

        if (!customerName || !items || items.length === 0) {
            return res.status(400).json({ message: 'Customer name and at least one item are required' });
        }

        // Calculate totals
        const calculatedItems = items.map(item => ({
            productId: item.productId || null,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
        }));

        const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
        const gstRate = 5;
        const gstAmount = Math.round((subtotal * gstRate / 100) * 100) / 100;
        const grandTotal = Math.round((subtotal + gstAmount) * 100) / 100;

        // Validate and reduce stock for products with productId
        for (const item of calculatedItems) {
            if (item.productId) {
                const product = await Product.findById(item.productId);
                if (product) {
                    if (product.stock < item.quantity) {
                        return res.status(400).json({
                            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                        });
                    }
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: { stock: -item.quantity }
                    });
                }
            }
        }

        // Generate bill number
        let billNo;
        try {
            const counter = await Counter.findOneAndUpdate(
                { id: 'saleBill' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            billNo = 'SAL' + (counter.seq || 1).toString().padStart(4, '0');
        } catch (e) {
            billNo = 'SAL' + Date.now().toString().slice(-6);
        }

        const bill = new SaleBill({
            billNo,
            customerName,
            customerPhone: customerPhone || '',
            items: calculatedItems,
            subtotal,
            gstRate,
            gstAmount,
            grandTotal,
            paymentMethod: paymentMethod || 'Cash',
            status: status || 'Paid',
            notes: notes || '',
            createdBy: req.user._id
        });

        await bill.save();
        res.status(201).json(bill);
    } catch (err) {
        console.error('Error creating sale bill:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get all Sale Bills
router.get('/', verifyToken, async (req, res) => {
    try {
        const { search, startDate, endDate, status } = req.query;
        let conditions = [];

        // Security: Filter by customer if role is customer
        if (req.user.role === 'customer') {
            const customer = await Customer.findOne({ userId: req.user._id });
            if (customer) {
                conditions.push({
                    $or: [
                        { customerPhone: customer.phone },
                        { customerName: customer.name }
                    ]
                });
            } else {
                conditions.push({
                    $or: [
                        { customerPhone: req.user.phone || 'N/A' },
                        { customerName: req.user.name }
                    ]
                });
            }
        }

        if (status) {
            conditions.push({
                status: Array.isArray(status) ? { $in: status } : status
            });
        }

        if (search) {
            conditions.push({
                $or: [
                    { billNo: { $regex: search, $options: 'i' } },
                    { customerName: { $regex: search, $options: 'i' } }
                ]
            });
        }

        if (startDate || endDate) {
            let dateQuery = {};
            if (startDate) dateQuery.$gte = new Date(startDate);
            if (endDate) dateQuery.$lte = new Date(endDate + 'T23:59:59');
            conditions.push({ billDate: dateQuery });
        }

        const query = conditions.length > 0 ? { $and: conditions } : {};
        const bills = await SaleBill.find(query).sort({ billDate: -1 });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single Sale Bill
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const bill = await SaleBill.findById(req.params.id).populate('items.productId');
        if (!bill) return res.status(404).json({ message: 'Sale bill not found' });
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Sale Bill Status
router.put('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status, paymentMethod } = req.body;
        const update = { status };
        if (paymentMethod) update.paymentMethod = paymentMethod;
        
        const bill = await SaleBill.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!bill) return res.status(404).json({ message: 'Sale bill not found' });
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Sale Bill
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const bill = await SaleBill.findByIdAndDelete(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Sale bill not found' });
        res.json({ message: 'Sale bill deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
