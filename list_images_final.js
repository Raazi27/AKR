import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function listAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({}, 'productId name image');
        console.log('--- PRODUCT LIST ---');
        products.forEach(p => {
            console.log(`[${p.productId}] ${p.name} -> Image: "${p.image}"`);
        });
        console.log('--------------------');
        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

listAll();
