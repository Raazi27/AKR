import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Invoice from './models/Invoice.js';
import Customer from './models/Customer.js';
import User from './models/User.js';

dotenv.config();

async function checkInvoices() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const invoices = await Invoice.find({}).sort({ invoiceDate: -1 }).limit(10);
        const customers = await Customer.find({});
        const users = await User.find({ role: 'customer' });

        const results = {
            invoices: invoices.map(inv => ({
                id: inv.invoiceId,
                storedCustId: inv.customerId,
                name: inv.customerName,
                date: inv.invoiceDate,
                items: inv.items.map(i => ({ name: i.name, quantity: i.quantity }))
            })),
            customers: customers.map(cust => ({
                id: cust.customerId,
                _id: cust._id,
                userId: cust.userId,
                name: cust.name
            })),
            users: users.map(u => ({
                _id: u._id,
                name: u.name,
                email: u.email
            }))
        };

        fs.writeFileSync('debug_output.json', JSON.stringify(results, null, 2));
        console.log('Results written to debug_output.json');

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkInvoices();
