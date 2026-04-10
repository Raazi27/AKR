import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    customerId: { type: String, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    pincode: { type: String },
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
        deliveryDate: Date
    },
    createdAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

customerSchema.pre('save', function (next) {
    if (this.email) {
        this.email = this.email.trim().toLowerCase();
    }
    next();
});

export default mongoose.model('Customer', customerSchema);
