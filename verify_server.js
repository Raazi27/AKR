const baseURL = 'http://localhost:5000/api';

async function verifyServer() {
    console.log('--- STARTING SERVER VERIFICATION (Using fetch) ---');

    // Helper for requests
    async function post(url, body, token) {
        console.log(`    POST ${url} ...`);
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        try {
            const res = await fetch(baseURL + url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                if (!res.ok) throw { status: res.status, data };
                return data;
            } catch (e) {
                throw { status: res.status, text }; // Not JSON
            }
        } catch (e) {
            throw e;
        }
    }

    async function get(url, token) {
        console.log(`    GET ${url} ...`);
        try {
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(baseURL + url, { headers });
            const text = await res.text();
            try {
                return JSON.parse(text); // Try parse JSON
            } catch (e) {
                return { message: text }; // Return raw text if not JSON
            }
        } catch (e) {
            throw e;
        }
    }

    // 0. Connectivity Check
    try {
        console.log('[0] Checking Connectivity...');
        const health = await get('/test');
        console.log('    [SUCCESS] Server Status:', health);
    } catch (err) {
        console.error('    [FAIL] Connectivity:', err);
    }

    // 1. Login or Register
    let token = '';
    try {
        console.log('[1] Attempting Login...');
        const loginData = await post('/auth/login', {
            email: 'admin@example.com',
            password: 'adminpassword'
        });
        token = loginData.token;
        console.log('    [SUCCESS] Logged in as:', loginData.role);
    } catch (err) {
        if (err.status === 400 || err.status === 404) { // Email not found
            console.log('    [INFO] Registering Admin...');
            try {
                await post('/auth/register', {
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'adminpassword',
                    role: 'admin'
                });
                console.log('    [SUCCESS] Registered Admin');
                // Login again
                const loginData = await post('/auth/login', {
                    email: 'admin@example.com',
                    password: 'adminpassword'
                });
                token = loginData.token;
                console.log('    [SUCCESS] Logged in after registration');
            } catch (regErr) {
                console.error('    [FAIL] Registration:', regErr);
                return;
            }
        } else {
            console.error('    [FAIL] Login:', err);
            return;
        }
    }

    if (token) {
        // 2. Add Customer
        let customerId = '';
        try {
            console.log('[2] Adding Customer...');
            const custData = await post('/customers', {
                name: 'Test Customer ' + Math.floor(Math.random() * 100),
                phone: '9876543210',
                email: 'test@example.com',
                address: '123 Test St',
                measurements: { chest: 40, waist: 32 }
            }, token);
            customerId = custData._id;
            console.log('    [SUCCESS] Customer Created:', custData.customerId);
        } catch (err) {
            console.error('    [FAIL] Add Customer:', err);
        }
    }

    console.log('--- VERIFICATION COMPLETE ---');
}

verifyServer();
