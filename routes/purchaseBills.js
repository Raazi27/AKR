import express from 'express';
import PurchaseBill from '../models/PurchaseBill.js';
import Counter from '../models/Counter.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create Purchase Bill
router.post('/', verifyToken, async (req, res) => {
    try {
        const { supplierName, supplierPhone, items, subtotal, notes } = req.body;

        if (!supplierName || !items || items.length === 0) {
            return res.status(400).json({ message: 'Supplier name and at least one item are required' });
        }

        // Generate bill codes
        let billNo;
        let grnNo;
        try {
            const billCounter = await Counter.findOneAndUpdate(
                { id: 'purchaseBill' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            billNo = 'PUR' + (billCounter.seq || 1).toString().padStart(4, '0');

            const grnCounter = await Counter.findOneAndUpdate(
                { id: 'grnNo' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            grnNo = 'GRN' + (grnCounter.seq || 1).toString().padStart(4, '0');
        } catch (e) {
            billNo = 'PUR' + Date.now().toString().slice(-6);
            grnNo = 'GRN' + Date.now().toString().slice(-6);
        }

        const bill = new PurchaseBill({
            billNo,
            grnNo,
            supplierName,
            supplierPhone: supplierPhone || '',
            items: items.map(item => {
                const total = item.useMeters 
                    ? (item.meters * item.ratePerMeter) 
                    : (item.quantity * item.unitPrice);
                
                return {
                    name: item.name,
                    quantity: item.useMeters ? null : item.quantity,
                    unitPrice: item.useMeters ? null : item.unitPrice,
                    useMeters: item.useMeters || false,
                    meters: item.useMeters ? item.meters : null,
                    ratePerMeter: item.useMeters ? item.ratePerMeter : null,
                    total: total
                };
            }),
            subtotal,
            notes: notes || '',
            createdBy: req.user._id
        });

        await bill.save();
        res.status(201).json(bill);
    } catch (err) {
        console.error('Error creating purchase bill:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get all Purchase Bills
router.get('/', verifyToken, async (req, res) => {
    try {
        const { search, startDate, endDate } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { billNo: { $regex: search, $options: 'i' } },
                { supplierName: { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            query.billDate = {};
            if (startDate) query.billDate.$gte = new Date(startDate);
            if (endDate) query.billDate.$lte = new Date(endDate + 'T23:59:59');
        }

        const bills = await PurchaseBill.find(query).sort({ billDate: -1 });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single Purchase Bill
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const bill = await PurchaseBill.findById(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Purchase bill not found' });
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Purchase Bill
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const bill = await PurchaseBill.findByIdAndDelete(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Purchase bill not found' });
        res.json({ message: 'Purchase bill deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
