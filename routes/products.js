import express from 'express';
import Product from '../models/Product.js';
import Counter from '../models/Counter.js';
import bwipjs from 'bwip-js';
import multer from 'multer';
import path from 'path';
import { verifyToken, isAdmin, isBilling } from '../middleware/auth.js';

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Add Product
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    console.log('[DEBUG] POST /api/products - Body:', req.body);
    console.log('[DEBUG] POST /api/products - File:', req.file);
    try {
        const { name, school, category, subCategory, size, price, stock, lowStockAlert, isUpcoming, releaseDate } = req.body;
        const image = req.file ? `/uploads/products/${req.file.filename}` : '';

        // Generate Product ID
        try {
            var counter = await Counter.findOneAndUpdate({ id: 'product' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        } catch (e) {
            // Mock fallback
            var counter = { seq: Date.now() };
        }

        const productId = 'PROD' + (counter.seq || '0').toString().padStart(4, '0');
        const barcode = productId;

        const product = new Product({
            productId, barcode, name, school, category, subCategory, image, size, price, stock, lowStockAlert,
            isUpcoming: isUpcoming === 'true' || isUpcoming === true,
            releaseDate: releaseDate || null
        });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Get all products (with pagination if needed, but for now just all)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Search
router.get('/search', async (req, res) => {
    const { query } = req.query;
    try {
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { barcode: { $regex: query, $options: 'i' } },
                { productId: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(products);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Update Product (Admin only)
router.put('/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    console.log('[DEBUG] PUT /api/products - ID:', req.params.id);
    console.log('[DEBUG] PUT /api/products - Body:', req.body);
    console.log('[DEBUG] PUT /api/products - File:', req.file);
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = `/uploads/products/${req.file.filename}`;
        }

        // Handle boolean conversion if coming from FormData
        if (updateData.isUpcoming !== undefined) {
            updateData.isUpcoming = updateData.isUpcoming === 'true' || updateData.isUpcoming === true;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Generate Barcode Image
router.get('/:id/barcode', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');

        bwipjs.toBuffer({
            bcid: 'code128',       // Barcode type
            text: product.barcode, // Text to encode
            scale: 3,               // 3x scaling factor
            height: 10,              // Bar height, in millimeters
            includetext: true,            // Show human-readable text
            textxalign: 'center',        // Always good to set this
        }, function (err, png) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.set('Content-Type', 'image/png');
                res.send(png);
            }
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(400).send(err.message);
    }
});

export default router;
