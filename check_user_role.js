import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'farmanraazi@gmail.com' });
        if (user) {
            console.log('User Found:');
            console.log('Email:', user.email);
            console.log('Role:', user.role);
        } else {
            console.log('User not found: farmanraazi@gmail.com');
        }
        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUser();
