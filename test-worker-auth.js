// Test worker authentication API
const https = require('https');

const data = JSON.stringify({
  email: 'john.worker@studentevents.com',
  password: 'worker123'
});

const options = {
  hostname: 'studentevents-production.up.railway.app',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing worker login...');
console.log('Data:', data);

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
