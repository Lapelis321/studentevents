// Test Authentication System
const https = require('https');

const API_BASE_URL = 'https://studentevents-production.up.railway.app';

async function testAuthSystem() {
    console.log('🧪 Testing Authentication System...\n');
    
    // Test 1: Admin Login
    console.log('1️⃣ Testing Admin Login...');
    try {
        const loginResponse = await makeRequest('/api/auth/login', 'POST', {
            email: 'admin@studentevents.com',
            password: 'admin123'
        });
        
        if (loginResponse.success && loginResponse.token) {
            console.log('✅ Admin login successful');
            console.log(`   Token: ${loginResponse.token.substring(0, 30)}...`);
            console.log(`   User: ${loginResponse.user.name} (${loginResponse.user.role})`);
            
            // Test 2: Token Verification
            console.log('\n2️⃣ Testing Token Verification...');
            try {
                const verifyResponse = await makeRequest('/api/auth/verify', 'GET', null, loginResponse.token);
                
                if (verifyResponse.success) {
                    console.log('✅ Token verification successful');
                    console.log(`   User: ${verifyResponse.user.email} (${verifyResponse.user.role})`);
                    
                    // Test 3: Logout
                    console.log('\n3️⃣ Testing Logout...');
                    try {
                        const logoutResponse = await makeRequest('/api/auth/logout', 'POST', null, loginResponse.token);
                        
                        if (logoutResponse.success) {
                            console.log('✅ Logout successful');
                            console.log(`   Message: ${logoutResponse.message}`);
                        } else {
                            console.log('❌ Logout failed:', logoutResponse);
                        }
                    } catch (error) {
                        console.log('❌ Logout error:', error.message);
                    }
                } else {
                    console.log('❌ Token verification failed:', verifyResponse);
                }
            } catch (error) {
                console.log('❌ Token verification error:', error.message);
            }
        } else {
            console.log('❌ Admin login failed:', loginResponse);
        }
    } catch (error) {
        console.log('❌ Admin login error:', error.message);
    }
    
    // Test 4: Worker Login
    console.log('\n4️⃣ Testing Worker Login...');
    try {
        const workerLoginResponse = await makeRequest('/api/auth/login', 'POST', {
            email: 'john.worker@studentevents.com',
            password: 'worker123'
        });
        
        if (workerLoginResponse.success && workerLoginResponse.token) {
            console.log('✅ Worker login successful');
            console.log(`   Token: ${workerLoginResponse.token.substring(0, 30)}...`);
            console.log(`   User: ${workerLoginResponse.user.name} (${workerLoginResponse.user.role})`);
        } else {
            console.log('❌ Worker login failed:', workerLoginResponse);
        }
    } catch (error) {
        console.log('❌ Worker login error:', error.message);
    }
    
    console.log('\n🎉 Authentication System Test Complete!');
}

function makeRequest(path, method, data, token = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: 'studentevents-production.up.railway.app',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData ? Buffer.byteLength(postData) : 0
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve(parsed);
                } catch (error) {
                    reject(new Error(`Invalid JSON response: ${responseData}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// Run the test
testAuthSystem().catch(console.error);
