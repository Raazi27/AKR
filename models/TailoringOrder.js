import mongoose from 'mongoose';

const tailoringOrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    measurements: {
        chest: Number,
        waist: Number,
        shoulder: Number,
        sleeveLength: Number,
        shirtLength: Number,
        pantWaist: Number,
        pantLength: Number,
        hip: Number,
        notes: String,
    },
    items: [String], // e.g., "Full Shirt", "Trouser"
    status: { type: String, enum: ['Pending', 'In Progress', 'Ready', 'Delivered'], default: 'Pending' },
    deliveryDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('TailoringOrder', tailoringOrderSchema);
