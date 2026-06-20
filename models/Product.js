import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    productId: { type: String, unique: true },
    name: { type: String, required: true },
    school: { type: String, required: true },
    category: { type: String, required: true, enum: ['Uniform', 'Fabric', 'Accessories'] },
    subCategory: { type: String },
    image: { type: String },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 10 },
    barcode: { type: String, unique: true },
    isUpcoming: { type: Boolean, default: false },
    releaseDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);
