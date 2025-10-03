// Simple Node.js server to serve frontend files
const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 8000;

// Security and performance headers
app.use((req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '0'); // Disable XSS filter (use CSP instead)
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self' http://localhost:3001 http://10.10.56.47:3001;");
    
    // Performance headers
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (req.url.match(/\.(html)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
    } else {
        res.setHeader('Cache-Control', 'public, max-age=0');
    }
    
    // Remove Express header
    res.removeHeader('X-Powered-By');
    
    next();
});

// Serve static files from current directory
app.use(express.static('.'));

// Handle URL routing for admin and worker pages
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/worker/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'worker', 'login.html'));
});

app.get('/worker', (req, res) => {
    res.sendFile(path.join(__dirname, 'worker', 'index.html'));
});

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
