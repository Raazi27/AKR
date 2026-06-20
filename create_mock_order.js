const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Invoice = require('./models/Invoice');
const Product = require('./models/Product');
const Customer = require('./models/Customer');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('MongoDB Connected');

        // 1. Get a Product (or create dummy)
        let product = await Product.findOne();
        if (!product) {
            product = await Product.create({
                name: 'Mock Uniform',
                category: 'Uniform',
                size: 'L',
                price: 500,
                stock: 100
            });
            console.log('Created dummy product');
        }

        // 2. Get a Customer (or create dummy)
        let customer = await Customer.findOne();
        if (!customer) {
            customer = await Customer.create({
                name: 'Mock Customer',
                email: 'mock@customer.com',
                phone: '1234567890',
                address: '123 Mock Lane',
                measurements: { chest: 40, length: 30 }
            });
            console.log('Created dummy customer');
        }

        // 3. Create Invoice
        const invoice = new Invoice({
            invoiceId: 'INV-MOCK-' + Date.now().toString().slice(-4),
            customerId: customer._id,
            items: [{
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: 2,
                discount: 0
            }],
            subtotal: 1000,
            tax: 180,
            grandTotal: 1180,
            paymentMethod: 'UPI',
            status: 'Pending',
            invoiceDate: new Date()
        });

        await invoice.save();
        console.log('Mock Order Created Successfully!');
        console.log('Invoice ID:', invoice.invoiceId);
        console.log('Status: Pending');

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
