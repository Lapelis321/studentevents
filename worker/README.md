# Worker Portal

This directory contains the worker portal for the StudentEvents ticketing system. The worker portal is separated from the main website for security and access control.

## Access

To access the worker portal, navigate directly to:
- `http://localhost:8000/worker/login.html` (when running locally)
- `https://yourdomain.com/worker/login.html` (in production)

The worker portal is **not** accessible through the main website navigation. Workers must type the URL directly into their browser.

## Demo Worker Accounts

For testing purposes, the following demo worker accounts are available:

| Username | Password | Role       | Name          |
|----------|----------|------------|---------------|
| worker1  | scan123  | Scanner    | John Smith    |
| worker2  | scan123  | Supervisor | Sarah Johnson |
| worker3  | scan123  | Scanner    | Mike Davis    |

## Files

- `login.html` - Worker login page
- `index.html` - Main worker scanner interface
- `worker-scan.css` - Styles for the worker portal
- `worker-scan.js` - JavaScript functionality for scanning

## Features

- **Secure Access**: Session-based authentication required
- **QR Code Scanning**: Camera-based ticket scanning
- **Manual Entry**: Fallback for manual ticket ID entry
- **Statistics**: Real-time scanning statistics
- **Responsive Design**: Works on mobile and desktop devices

## Security

- Workers must log in to access the scanner
- Session data is stored locally and cleared on logout
- No direct links from the main website
- Access only via direct URL entry
