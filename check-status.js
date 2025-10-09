// Status check script for StudentEvents
const http = require('http');

console.log('🔍 Checking StudentEvents Status...\n');

// Check backend health
function checkBackend() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          console.log('✅ Backend Server: RUNNING');
          console.log(`   Status: ${health.status}`);
          console.log(`   Environment: ${health.environment}`);
          console.log(`   Database: ${health.database}`);
          resolve(true);
        } catch (e) {
          console.log('❌ Backend Server: ERROR - Invalid response');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ Backend Server: NOT RUNNING');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Backend Server: TIMEOUT');
      resolve(false);
    });
  });
}

// Check events API
function checkEventsAPI() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/api/events', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const events = JSON.parse(data);
          console.log('✅ Events API: WORKING');
          console.log(`   Events loaded: ${events.length}`);
          if (events.length > 0) {
            console.log(`   Sample event: ${events[0].title}`);
          }
          resolve(true);
        } catch (e) {
          console.log('❌ Events API: ERROR - Invalid response');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ Events API: NOT WORKING');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Events API: TIMEOUT');
      resolve(false);
    });
  });
}

// Check frontend
function checkFrontend() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:8000', (res) => {
      console.log('✅ Frontend Server: RUNNING');
      console.log(`   Status Code: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', () => {
      console.log('❌ Frontend Server: NOT RUNNING');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Frontend Server: TIMEOUT');
      resolve(false);
    });
  });
}

// Run all checks
async function runChecks() {
  console.log('🚀 StudentEvents Status Check\n');
  
  const backendOk = await checkBackend();
  console.log('');
  
  const eventsOk = await checkEventsAPI();
  console.log('');
  
  const frontendOk = await checkFrontend();
  console.log('');
  
  // Summary
  console.log('📊 SUMMARY:');
  console.log(`   Backend: ${backendOk ? '✅' : '❌'}`);
  console.log(`   Events API: ${eventsOk ? '✅' : '❌'}`);
  console.log(`   Frontend: ${frontendOk ? '✅' : '❌'}`);
  
  if (backendOk && eventsOk && frontendOk) {
    console.log('\n🎉 ALL SYSTEMS WORKING!');
    console.log('\n🎯 Your website is ready:');
    console.log('   Frontend: http://localhost:8000');
    console.log('   Backend API: http://localhost:3001');
    console.log('   Admin Panel: http://localhost:8000/admin/');
    console.log('   Worker Interface: http://localhost:8000/worker/');
    console.log('\n🔐 Demo Accounts:');
    console.log('   Admin: admin@studentevents.com / admin123');
    console.log('   Worker: john.worker@studentevents.com / worker123');
  } else {
    console.log('\n⚠️  Some systems need attention.');
    console.log('\n🔧 To fix issues:');
    if (!backendOk) {
      console.log('   - Start backend: cd backend && node railway-server.js');
    }
    if (!frontendOk) {
      console.log('   - Start frontend: node start-frontend.js');
    }
  }
}

runChecks();
