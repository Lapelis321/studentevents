# Deployment Checklist - Complete System Rebuild

## ✅ Pre-Deployment (All Complete!)

- [x] All backend code written and tested
- [x] All frontend code written and tested
- [x] Database schema created
- [x] Seed data prepared
- [x] Documentation complete
- [x] Environment variables documented

## 🚀 Deployment Steps

### Step 1: Deploy Database to Supabase

1. **Login to Supabase**
   - Go to: https://supabase.com
   - Sign in or create account

2. **Create/Select Project**
   - Click "New Project" or select existing
   - Note your project reference and password

3. **Run Database Schema**
   ```sql
   -- In Supabase SQL Editor, copy and paste from:
   database/schema.sql
   -- Then click "Run"
   ```

4. **Run Seed Data**
   ```sql
   -- In Supabase SQL Editor, copy and paste from:
   database/seed.sql
   -- Then click "Run"
   ```

5. **Get Connection String**
   - Go to: Project Settings → Database
   - Copy **Pooler** connection string (port 6543)
   - Format: `postgresql://postgres.[ref]:[password]@[host]:6543/postgres`
   - Save this - you'll need it for Railway

**Status**: [ ] Complete

---

### Step 2: Deploy Backend to Railway

1. **Login to Railway**
   - Go to: https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if needed
   - Select this repository

3. **Configure Build Settings**
   - Root Directory: `backend-new`
   - Start Command: `npm start` (should auto-detect)
   - Build Command: (leave empty, just npm install)

4. **Add Environment Variables**
   
   In Railway project settings → Variables, add:
   
   ```
   PORT=3001
   NODE_ENV=production
   DATABASE_URL=<paste your Supabase connection string>
   JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   SENDGRID_API_KEY=<your SendGrid API key>
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=StudentEvents
   STRIPE_SECRET_KEY=<your Stripe secret key>
   STRIPE_PUBLISHABLE_KEY=<your Stripe publishable key>
   STRIPE_WEBHOOK_SECRET=<set this after creating webhook>
   FRONTEND_URL=<your Netlify URL - set after step 3>
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Copy your Railway URL (e.g., `https://your-app.up.railway.app`)

6. **Test Backend**
   - Visit: `https://your-app.up.railway.app/api/events`
   - Should return: `[]` (empty array) or events if any
   - If you get this, backend is working!

**Status**: [ ] Complete

---

### Step 3: Deploy Frontend to Netlify

1. **Update API Configuration**
   
   Before deploying, update `frontend-new/js/config.js`:
   
   ```javascript
   const API_BASE_URL = 'https://your-app.up.railway.app';  // Your Railway URL
   ```

2. **Commit Changes**
   ```bash
   git add frontend-new/js/config.js
   git commit -m "Update API URL for production"
   git push
   ```

3. **Login to Netlify**
   - Go to: https://netlify.com
   - Sign in with GitHub

4. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select this repository

5. **Configure Build Settings**
   - Base directory: `frontend-new`
   - Build command: (leave empty)
   - Publish directory: `.` (or leave empty)

6. **Deploy**
   - Click "Deploy site"
   - Wait for deployment (1-2 minutes)
   - Copy your Netlify URL (e.g., `https://your-site.netlify.app`)

7. **Update Backend CORS**
   
   Go back to Railway → Variables and update:
   ```
   FRONTEND_URL=https://your-site.netlify.app
   ```
   
   Backend will auto-redeploy with new CORS settings.

**Status**: [ ] Complete

---

### Step 4: Configure Services

#### A. SendGrid Setup
1. Go to: https://app.sendgrid.com/settings/api_keys
2. Create new API key with "Full Access"
3. Add to Railway environment variables
4. Verify sender email in SendGrid

**Status**: [ ] Complete

#### B. Stripe Setup (Optional)
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Get test keys (or live keys for production)
3. Add to Railway environment variables
4. Create webhook:
   - URL: `https://your-app.up.railway.app/api/payments/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
5. Copy webhook secret and add to Railway

**Status**: [ ] Complete

---

### Step 5: Post-Deployment Configuration

1. **Change Default Admin Password**
   - Visit: `https://your-site.netlify.app/admin/login.html`
   - Login with: `admin@studentevents.com` / `Admin123!`
   - Go to Workers → Create new admin
   - Delete default admin

2. **Configure System Settings**
   - Go to Settings in admin panel
   - Set payment method (Stripe or Bank Transfer)
   - If using bank transfer: Add bank details
   - Update contact information
   - Update organization details

3. **Test Complete Flow**
   - Create a test event
   - Visit public site
   - Book a ticket (test payment)
   - Check email delivery
   - Login as worker
   - Verify ticket

**Status**: [ ] Complete

---

## 🧪 End-to-End Testing

### Public Website Tests
- [ ] Homepage loads and displays events
- [ ] Event details page works
- [ ] Can create booking
- [ ] Stripe payment works (test mode)
- [ ] Bank transfer flow works
- [ ] Confirmation email received
- [ ] PDF ticket received
- [ ] Rules page loads
- [ ] Contacts page loads

### Admin Panel Tests
- [ ] Admin login works
- [ ] Can create new event
- [ ] Can edit event
- [ ] Can delete event
- [ ] Can view bookings
- [ ] Can confirm payment
- [ ] Can create worker
- [ ] Can update settings

### Worker Panel Tests
- [ ] Worker login works
- [ ] Can search tickets
- [ ] Ticket validation works
- [ ] Payment status displays correctly

### Supervisor Panel Tests
- [ ] Supervisor login works
- [ ] Can view participant list
- [ ] Can confirm payments
- [ ] Can export data

---

## 📊 Deployment Summary

### URLs
- **Frontend**: https://your-site.netlify.app
- **Backend**: https://your-app.up.railway.app
- **Database**: Supabase project dashboard
- **Admin Panel**: https://your-site.netlify.app/admin/login.html
- **Worker Panel**: https://your-site.netlify.app/worker/login.html

### Default Credentials (CHANGE IMMEDIATELY!)
- **Admin**: admin@studentevents.com / Admin123!
- **Worker**: worker@test.com / Worker123!
- **Supervisor**: supervisor@test.com / Supervisor123!

### Support Resources
- Main README: `COMPLETE_REBUILD_README.md`
- Deployment Guide: `REBUILD_DEPLOYMENT_GUIDE.md`
- Status Report: `REBUILD_COMPLETE_STATUS.md`
- This Checklist: `deploy-checklist.md`

---

## 🎉 Deployment Complete!

Once all checkboxes above are checked, your system is fully deployed and operational.

**Next Steps**:
1. Share URLs with stakeholders
2. Monitor logs for any errors
3. Set up regular database backups
4. Plan future enhancements

**Monitoring**:
- Railway logs: https://railway.app → Your project → Deployments
- Netlify logs: https://app.netlify.com → Your site → Deploys
- Supabase logs: Supabase dashboard → Logs

---

*Deployment checklist for Complete System Rebuild*
*Last updated: October 22, 2025*

