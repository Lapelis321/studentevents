# Admin Dashboard - StudentEvents

This is the administrative interface for the StudentEvents platform, separated from the main public website for security and organization.

## 🔐 Access

The admin dashboard is **not linked** from the main website and must be accessed directly via URL:

- **Admin Login**: `/admin/login.html`
- **Admin Dashboard**: `/admin/index.html` (requires authentication)

## 🚪 Demo Login Credentials

For demonstration purposes:
- **Username**: `admin`
- **Password**: `admin123`

## 🛡️ Security Features

### Current Implementation (Demo)
- Simple session-based access control
- Login page with credential validation
- Automatic redirect to login if not authenticated
- Logout functionality with session cleanup

### Production Recommendations
- Replace with proper authentication system (JWT, OAuth, etc.)
- Implement role-based access control
- Add password hashing and secure storage
- Enable HTTPS and secure session management
- Add audit logging for admin actions
- Implement rate limiting and brute force protection

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
2. Valid credentials → session storage set → redirect to dashboard
3. Invalid credentials → error message displayed
4. Dashboard access → session validated → content loaded
5. Logout → session cleared → redirect to login

### Session Management
- Uses `sessionStorage` for demo purposes
- Session expires when browser tab closes
- Logout clears all session data

## 🚀 Usage

### For Administrators
1. Navigate to `/admin/login.html`
2. Enter credentials (admin/admin123)
3. Access full dashboard functionality
4. Use logout button when finished

### For Developers
1. Customize authentication in production
2. Modify access controls as needed
3. Add additional admin features
4. Integrate with backend API

## 🔒 Security Notes

⚠️ **Important**: This is a demo implementation. For production use:

- Implement proper server-side authentication
- Use secure password storage (bcrypt, etc.)
- Add CSRF protection
- Enable secure session management
- Implement proper authorization checks
- Add audit logging
- Use HTTPS in production

## 📞 Support

For questions about the admin system, refer to the main project documentation or contact the development team.
