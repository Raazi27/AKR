import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    const token = jwt.sign({ _id: '65f123456789012345678901', role: 'admin' }, process.env.JWT_SECRET);
    try {
        const res = await axios.get('http://localhost:5000/api/stats/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success:', Object.keys(res.data).length);
    } catch (err) {
        console.log('Status:', err.response?.status);
        console.log('Data:', err.response?.data);
    }
};

test();
