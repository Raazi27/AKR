import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import productRoutes from './routes/products.js';
import tailoringRoutes from './routes/tailoring.js';
import userRoutes from './routes/users.js';
import statsRoutes from './routes/stats.js';
import otpRoutes from './routes/otp.js';
import purchaseBillRoutes from './routes/purchaseBills.js';
import saleBillRoutes from './routes/saleBills.js';

import connectDB from './config/db.js';

const app = express();


// ======================
// Security Middleware
// ======================

app.use(helmet());

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://al-kabah-uniform.vercel.app'
    ],
    credentials: true
}));


// ======================
// Performance Middleware
// ======================

app.use(compression());

app.use(express.json({
    limit: '10mb'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));


// ======================
// Static Files
// ======================

app.use('/uploads', express.static('uploads'));


// ======================
// API Routes
// ======================

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tailoring', tailoringRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/purchase-bills', purchaseBillRoutes);
app.use('/api/sale-bills', saleBillRoutes);


// ======================
// Health Check Routes
// ======================

app.get('/api', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Al-Kabah API Backend Running',
        uptime: process.uptime()
    });
});

app.get('/api/test', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Backend Server is Online',
        timestamp: new Date()
    });
});


// ======================
// Error Handler
// ======================

app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});


// ======================
// Database Connection & Server Start
// ======================

const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;
        if (process.env.VERCEL !== '1') {
            app.listen(PORT, () => {
                console.log(`✅ Server running on port ${PORT}`);
            });
        }
    } catch (error) {
        console.error('❌ Failed to start server due to DB connection error:', error.message);
        // On Vercel, we still need to export the app, but local server won't listen
    }
};

startServer();


export default app;
