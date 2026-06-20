import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({}, 'name image productId');
        console.log('Product Images:');
        products.forEach(p => {
            console.log(`ID: ${p.productId} | Name: ${p.name} | Image: ${p.image || 'NONE'}`);
        });
        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkProducts();
