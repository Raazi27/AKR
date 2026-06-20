import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function runTest() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD
        });
        const token = loginRes.data.token;
        console.log('Logged in successfully.');

        // 2. Upload
        console.log('Uploading product...');
        const data = new FormData();
        data.append('name', 'Digital Test Product');
        data.append('school', 'Digital Academy');
        data.append('category', 'Uniform');
        data.append('size', 'XL');
        data.append('price', 500);
        data.append('stock', 20);
        data.append('lowStockAlert', 5);

        fs.writeFileSync('test_image.jpg', 'fake image data');
        data.append('image', fs.createReadStream('test_image.jpg'));

        const uploadRes = await axios.post('http://localhost:5000/api/products', data, {
            headers: {
                ...data.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Upload Result:', uploadRes.data);

        // 3. Verify static access
        if (uploadRes.data.image) {
            console.log('Verifying static access to:', `http://localhost:5000${uploadRes.data.image}`);
            const imgRes = await axios.get(`http://localhost:5000${uploadRes.data.image}`);
            console.log('Image Access Status:', imgRes.status);
        }

    } catch (err) {
        console.error('Test Failed:', err.response?.data || err.message);
    } finally {
        if (fs.existsSync('test_image.jpg')) fs.unlinkSync('test_image.jpg');
    }
}

runTest();
