// Simple HTTP server for frontend development
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Default to index.html for root and directories
  if (pathname === '/') {
    pathname = '/index.html';
  } else if (pathname === '/admin' || pathname === '/admin/') {
    pathname = '/admin/index.html';
  } else if (pathname === '/worker' || pathname === '/worker/') {
    pathname = '/worker/index.html';
  } else if (pathname === '/admin/login' || pathname === '/admin/login/') {
    pathname = '/admin/login.html';
  } else if (pathname === '/worker/login' || pathname === '/worker/login/') {
    pathname = '/worker/login.html';
  }
  
  // Security: prevent directory traversal
  if (pathname.includes('..')) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }
  
  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, try index.html
        if (pathname !== '/index.html') {
          const indexPath = path.join(__dirname, 'index.html');
          fs.readFile(indexPath, (err, data) => {
            if (err) {
              res.writeHead(404);
              res.end('File not found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(data);
            }
          });
        } else {
          res.writeHead(404);
          res.end('File not found');
        }
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🌐 Frontend server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`🎯 Open your browser to: http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Frontend server shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Frontend server shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
