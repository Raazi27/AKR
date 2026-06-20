import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        let admin = await User.findOne({ role: 'admin' });

        if (admin) {
            console.log('Updating existing admin...');
            admin.name = 'Farman Raazi';
            admin.email = email;
            admin.password = password; // Schema pre-save will hash this
            await admin.save();
            console.log('Admin updated successfully');
        } else {
            console.log('Creating new admin...');
            admin = new User({
                name: 'Farman Raazi',
                email,
                password,
                role: 'admin'
            });
            await admin.save();
            console.log('Admin user created successfully');
        }

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
