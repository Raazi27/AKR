import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function testUpload() {
    try {
        const data = new FormData();
        data.append('name', 'Test Product');
        data.append('school', 'Test School');
        data.append('category', 'Uniform');
        data.append('size', 'L');
        data.append('price', 100);
        data.append('stock', 50);

        // Create a dummy image file
        fs.writeFileSync('dummy.jpg', 'dummy content');
        data.append('image', fs.createReadStream('dummy.jpg'));

        const res = await axios.post('http://localhost:5000/api/products', data, {
            headers: {
                ...data.getHeaders(),
                // We need a token. I'll need to fetch one or bypass.
                // For testing, I'll temporarily disable auth in products.js if needed, 
                // but let's try to get a token if I know the credentials.
            }
        });
        console.log('Upload Success:', res.data);
    } catch (err) {
        console.error('Upload Failed:', err.response?.data || err.message);
    } finally {
        if (fs.existsSync('dummy.jpg')) fs.unlinkSync('dummy.jpg');
    }
}

// I don't have a valid token here unless I login.
// I'll create a script that logins and then uploads.
console.log('Need to login first...');
