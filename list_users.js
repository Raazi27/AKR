import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'email role');
        console.log('All Users:');
        users.forEach(u => console.log(`${u.email} - ${u.role}`));
        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

listUsers();
