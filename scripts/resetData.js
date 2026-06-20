import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from '../models/Invoice.js';
import TailoringOrder from '../models/TailoringOrder.js';
import Counter from '../models/Counter.js';

dotenv.config({ path: '../.env' }); // Adjust if running from scripts folder

const resetData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear Documents
        console.log('Clearing Invoices...');
        await Invoice.deleteMany({});

        console.log('Clearing Tailoring Orders...');
        await TailoringOrder.deleteMany({});

        // Reset Counters
        console.log('Resetting Counters...');
        await Counter.findOneAndUpdate({ id: 'invoice' }, { seq: 0 }, { upsert: true });
        await Counter.findOneAndUpdate({ id: 'customerId' }, { seq: 0 }, { upsert: true });

        console.log('Data Reset Successful');
        process.exit(0);
    } catch (err) {
        console.error('Reset Failed:', err.message);
        process.exit(1);
    }
};

resetData();
