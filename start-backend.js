// Backend server starter with keep-alive
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Backend Server...');

const backendPath = path.join(__dirname, 'backend', 'railway-server.js');
const backendProcess = spawn('node', [backendPath], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'backend')
});

backendProcess.on('error', (err) => {
  console.error('❌ Backend server error:', err);
});

backendProcess.on('exit', (code) => {
  console.log(`🛑 Backend server exited with code ${code}`);
  if (code !== 0) {
    console.log('🔄 Restarting backend server in 3 seconds...');
    setTimeout(() => {
      console.log('🔄 Restarting backend server...');
      startBackend();
    }, 3000);
  }
});

function startBackend() {
  const newProcess = spawn('node', [backendPath], {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'backend')
  });
  
  newProcess.on('error', (err) => {
    console.error('❌ Backend server error:', err);
  });
  
  newProcess.on('exit', (code) => {
    console.log(`🛑 Backend server exited with code ${code}`);
    if (code !== 0) {
      console.log('🔄 Restarting backend server in 3 seconds...');
      setTimeout(() => {
        startBackend();
      }, 3000);
    }
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down backend server...');
  backendProcess.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down backend server...');
  backendProcess.kill();
  process.exit(0);
});

console.log('✅ Backend server started successfully!');
console.log('🌐 Backend API: http://localhost:3001');
console.log('🔍 Health Check: http://localhost:3001/health');
console.log('📚 Events API: http://localhost:3001/api/events');
console.log('');
console.log('Press Ctrl+C to stop the server');
