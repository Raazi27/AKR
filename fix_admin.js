import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function fixAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Ensure both emails are admin
        const admins = ['farmanraazi2006@gmail.com', 'farmanraazi@gmail.com', 'raazi@gmail.com'];

        for (const email of admins) {
            const user = await User.findOne({ email });
            if (user) {
                user.role = 'admin';
                await user.save();
                console.log(`Updated ${email} to admin.`);
            } else {
                console.log(`User ${email} not found.`);
            }
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

fixAdmin();
