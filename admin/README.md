# Admin Dashboard - StudentEvents

This is the administrative interface for the StudentEvents platform, separated from the main public website for security and organization.

## 🔐 Access

The admin dashboard is **not linked** from the main website and must be accessed directly via URL:

- **Admin Login**: `/admin/login.html`
- **Admin Dashboard**: `/admin/index.html` (requires authentication)

## 🛡️ Security Features

### Current Implementation
- JWT-based authentication with API backend
- Email/password login system
- Secure token storage in localStorage
- Role-based access control (admin only)
- Automatic session management
- Logout functionality with token cleanup

### Production Features
- Secure password hashing (bcrypt)
- JWT token validation
- HTTPS enforcement
- Rate limiting and brute force protection
- Audit logging for admin actions
- Session timeout management

## 📁 File Structure

```
admin/
├── index.html              # Main admin dashboard
├── login.html              # Admin login page
├── admin-dashboard.css     # Admin-specific styles
├── admin-dashboard.js      # Admin functionality
└── README.md              # This file
```

## 🎯 Features

### Dashboard Sections
1. **Events Management**
   - View all events with statistics
   - Create, edit, delete events
   - Export event data
   - Track ticket sales

2. **Worker Management**
   - Manage worker accounts
   - View worker activity
   - Enable/disable worker access
   - Export worker data

3. **System Settings**
   - Organization configuration
   - Policy management
   - System preferences
   - Data backup and export

### Navigation
- **Back Button**: Returns to previous page
- **Logout Button**: Secure session termination
- **Responsive Design**: Works on all devices

## 🔧 Technical Details

### Authentication Flow
1. User accesses `/admin/` → redirected to `login.html`
2. Valid email/password → JWT token received → localStorage set → redirect to dashboard
3. Invalid credentials → error message displayed
4. Dashboard access → token validated → content loaded
5. Logout → token cleared → redirect to login

### API Integration
- Connects to Railway backend API
- JWT token authentication
- Real-time data synchronization
- Error handling and retry logic

## 🚀 Usage

### For Administrators
1. Navigate to `/admin/login.html`
2. Enter your admin email and password
3. Access full dashboard functionality
4. Use logout button when finished

### For Developers
1. Configure API endpoints in config.js
2. Modify authentication as needed
3. Add additional admin features
4. Integrate with backend API

## 🔒 Security Notes

✅ **Production Ready**: This implementation includes:

- JWT-based authentication
- Secure API communication
- Input validation and sanitization
- Error handling without information disclosure
- Clean form design without demo credentials
- Proper session management

## 📞 Support

For questions about the admin system, refer to the main project documentation or contact the development team.
