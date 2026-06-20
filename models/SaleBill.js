import mongoose from 'mongoose';

const saleBillSchema = new mongoose.Schema({
    billNo: { type: String, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    gstRate: { type: Number, default: 5 },
    gstAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI'], default: 'Cash' },
    status: { type: String, enum: ['Paid', 'Unpaid', 'Partial', 'Pending'], default: 'Paid' },
    notes: { type: String },
    billDate: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('SaleBill', saleBillSchema);
