import mongoose from 'mongoose';

const purchaseBillSchema = new mongoose.Schema({
    billNo: { type: String, unique: true },
    grnNo: { type: String, unique: true },
    supplierName: { type: String, required: true },
    supplierPhone: { type: String },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number },
        unitPrice: { type: Number },
        useMeters: { type: Boolean, default: false },
        meters: { type: Number },
        ratePerMeter: { type: Number },
        total: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    notes: { type: String },
    billDate: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('PurchaseBill', purchaseBillSchema);
