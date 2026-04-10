import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const login = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'tabezniyazif03@gmail.com',
            password: 'Raazi@26'
        });
        return res.data.token;
    } catch (err) {
        console.error('Login failed:', err.response?.data || err.message);
        return null;
    }
};

const verify = async () => {
    const token = await login();
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
        console.log('Creating test purchase bill...');
        const res = await axios.post('http://localhost:5000/api/purchase-bills', {
            supplierName: 'Test Supplier',
            items: [
                { name: 'Item 1', quantity: 5, unitPrice: 100, useMeters: false },
                { name: 'Item 2', meters: 10, ratePerMeter: 50, useMeters: true }
            ],
            subtotal: 1000,
            notes: 'Verification test'
        }, { headers });

        console.log('Bill Created Successfully!');
        console.log('Bill No:', res.data.billNo);
        console.log('GRN No:', res.data.grnNo);
        console.log('Items:', JSON.stringify(res.data.items, null, 2));

        if (res.data.grnNo && res.data.grnNo.startsWith('GRN')) {
            console.log('✅ GRN Generation Verified');
        } else {
            console.log('❌ GRN Generation Failed');
        }

        const meterItem = res.data.items.find(i => i.useMeters);
        if (meterItem && meterItem.total === 500 && meterItem.meters === 10) {
            console.log('✅ Meter-based Pricing Verified');
        } else {
            console.log('❌ Meter-based Pricing Failed');
        }

    } catch (err) {
        console.error('Verification failed:', err.response?.data || err.message);
    }
};

verify();
