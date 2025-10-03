// Simple Node.js server to serve frontend files
const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 8000;

// Serve static files from current directory
app.use(express.static('.'));

// Get network IP address
function getNetworkIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const networkIP = getNetworkIP();

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Frontend server running on:`);
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Network:  http://${networkIP}:${PORT}`);
    console.log(`   External: http://${networkIP}:${PORT}`);
    console.log(`\n📱 Access from other devices on the same network using:`);
    console.log(`   http://${networkIP}:${PORT}`);
});
