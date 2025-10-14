# 📧 Email System Setup Guide

## Current Issue: Emails Not Being Sent

The email system is implemented but emails are not being received because:

1. **SendGrid API Key** may not be configured
2. **From Email Address** needs to be verified with SendGrid
3. **Email domain** needs to be properly set up

## 🔧 Required Configuration

### 1. SendGrid API Key
You need a SendGrid account and API key:

1. **Sign up for SendGrid:** https://sendgrid.com/
2. **Get API Key:** 
   - Go to Settings → API Keys
   - Create API Key with "Full Access" permissions
   - Copy the API key (starts with `SG.`)

### 2. From Email Address
The system currently uses: `noreply@studentevents.com`

**This email must be verified with SendGrid:**
- Go to SendGrid → Settings → Sender Authentication
- Add and verify `noreply@studentevents.com`
- Or use a different verified email address

### 3. Environment Variables
Set these in your Railway deployment:

```
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=noreply@studentevents.com
FROM_NAME=StudentEvents
```

## 🚀 Quick Fix Options

### Option 1: Use Your Personal Email (Temporary)
Change the from email to your personal Gmail/Outlook:

```javascript
// In backend/railway-server.js, line 816:
from: process.env.SENDGRID_FROM_EMAIL || 'your-email@gmail.com',
```

### Option 2: Use SendGrid's Test Email
Use SendGrid's default test email:

```javascript
// In backend/railway-server.js, line 816:
from: process.env.SENDGRID_FROM_EMAIL || 'test@example.com',
```

### Option 3: Set Up Proper Domain
1. **Buy a domain** (e.g., `studentevents.com`)
2. **Set up DNS records** for SendGrid
3. **Verify domain** in SendGrid
4. **Use domain email** (e.g., `noreply@studentevents.com`)

## 🧪 Testing Email System

### Test 1: Check Environment Variables
Add this to your backend to verify configuration:

```javascript
console.log('📧 Email Configuration:');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'Missing');
console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || 'Not set');
```

### Test 2: Manual Email Test
Create a test endpoint to send a test email:

```javascript
app.post('/api/test-email', async (req, res) => {
  try {
    const msg = {
      to: 'your-email@example.com',
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@studentevents.com',
      subject: 'Test Email from StudentEvents',
      html: '<h1>Test Email</h1><p>This is a test email from StudentEvents.</p>'
    };
    
    await sgMail.send(msg);
    res.json({ success: true, message: 'Test email sent' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});
```

## 📋 Current Email Template

When a booking is approved, customers receive:

**Subject:** `Your Ticket for [Event Name] - Payment Confirmed ✓`

**Content:**
- Professional HTML template
- Event details (date, time, location, dress code)
- Valid ticket with QR code
- Contact information

## 🔍 Troubleshooting

### Check 1: Railway Environment Variables
1. Go to Railway dashboard
2. Select your project
3. Go to Variables tab
4. Verify these are set:
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`

### Check 2: SendGrid Dashboard
1. Go to SendGrid → Activity
2. Check if emails are being sent
3. Look for delivery status
4. Check for bounces or blocks

### Check 3: Email Spam Folder
- Check spam/junk folder
- Add `noreply@studentevents.com` to contacts
- Whitelist the sender domain

## 🎯 Immediate Action Required

**To fix emails immediately:**

1. **Get SendGrid API Key** (free account)
2. **Set environment variables** in Railway
3. **Use verified email address** as sender
4. **Test with your personal email**

**Recommended sender emails:**
- `noreply@studentevents.com` (if domain verified)
- `your-email@gmail.com` (temporary)
- `test@example.com` (SendGrid default)

## 📞 Support

If you need help setting up SendGrid:
1. **SendGrid Documentation:** https://docs.sendgrid.com/
2. **Email Setup Guide:** https://docs.sendgrid.com/for-developers/sending-email/sender-identity
3. **API Key Setup:** https://docs.sendgrid.com/ui/account-and-settings/api-keys
