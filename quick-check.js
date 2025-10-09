// Quick status check for StudentEvents
const http = require('http');

console.log('🔍 Quick Status Check...\n');

// Test backend health
http.get('http://localhost:3001/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ Backend Server: RUNNING');
    console.log('   Response:', data.substring(0, 100) + '...');
    
    // Test events API
    http.get('http://localhost:3001/api/events', (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log('✅ Events API: WORKING');
        console.log('   Events loaded:', JSON.parse(data2).length);
        
        // Test frontend
        http.get('http://localhost:8000', (res3) => {
          console.log('✅ Frontend Server: RUNNING');
          console.log('   Status Code:', res3.statusCode);
          
          console.log('\n🎉 ALL SYSTEMS WORKING!');
          console.log('\n🎯 Your website is ready:');
          console.log('   Frontend: http://localhost:8000');
          console.log('   Backend API: http://localhost:3001');
          console.log('   Admin Panel: http://localhost:8000/admin/');
          console.log('   Worker Interface: http://localhost:8000/worker/');
        }).on('error', () => {
          console.log('❌ Frontend Server: NOT RUNNING');
        });
      });
    }).on('error', () => {
      console.log('❌ Events API: NOT WORKING');
    });
  });
}).on('error', () => {
  console.log('❌ Backend Server: NOT RUNNING');
  console.log('\n🔧 To start servers:');
  console.log('   1. Backend: cd backend && node railway-server.js');
  console.log('   2. Frontend: node start-frontend.js');
});
