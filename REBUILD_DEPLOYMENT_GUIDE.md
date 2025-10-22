# Complete Rebuild - Deployment Guide

## ✅ Implementation Status

### Phase 1: Database Foundation ✅
- ✅ Complete database schema with all tables (admin, events, bookings, workers, settings, policies)
- ✅ Seed data script with default admin, settings, and policies

**Files Created:**
- `database/schema.sql` - Complete PostgreSQL schema
- `database/seed.sql` - Initial data with admin account

### Phase 2: Backend API Development ✅
- ✅ Express server with middleware, CORS, database connection, error handling
- ✅ Authentication system with JWT for admin and workers
- ✅ Events API with all CRUD endpoints
- ✅ Bookings API with CRUD, search, export, and confirmation
- ✅ Workers API with CRUD and ticket verification
- ✅ Settings API for system configuration
- ✅ Policies API for terms, privacy, etc.
- ✅ Stripe and manual bank transfer payment integration
- ✅ Email service with SendGrid and PDF ticket generation

**Files Created:**
- `backend-new/server.js` - Main server
- `backend-new/middleware/auth.js` - JWT authentication
- `backend-new/routes/auth.js` - Login endpoints
- `backend-new/routes/events.js` - Events CRUD
- `backend-new/routes/bookings.js` - Bookings management
- `backend-new/routes/workers.js` - Workers management
- `backend-new/routes/settings.js` - System settings
- `backend-new/routes/policies.js` - Policies content
- `backend-new/routes/payments.js` - Payment processing
- `backend-new/services/email.js` - SendGrid integration
- `backend-new/services/tickets.js` - PDF generation
- `backend-new/package.json` - Dependencies
- `backend-new/env.example` - Environment template

### Phase 3: Admin Panel Frontend ✅
- ✅ Admin login page with authentication
- ✅ Admin dashboard layout with navigation
- ✅ Events management page with full CRUD
- ✅ Bookings management with search, filter, export
- ✅ Workers management page
- ✅ Settings page with all configuration options

**Files Created:**
- `frontend-new/admin/login.html` - Admin login
- `frontend-new/admin/dashboard.html` - Main dashboard
- `frontend-new/admin/js/login.js` - Login logic
- `frontend-new/admin/js/dashboard.js` - Dashboard controller with events, bookings, workers, settings managers

### Phase 4: Worker/Supervisor Panel ✅
- ✅ Worker/supervisor login with role-based routing
- ✅ Worker dashboard with QR scanning and ticket validation
- ✅ Supervisor dashboard with additional permissions

**Files Created:**
- `frontend-new/worker/login.html` - Worker login
- `frontend-new/worker/dashboard.html` - Worker dashboard
- `frontend-new/worker/supervisor.html` - Supervisor dashboard
- `frontend-new/worker/js/login.js` - Login logic
- `frontend-new/worker/js/worker.js` - Ticket verification
- `frontend-new/worker/js/supervisor.js` - Supervisor features

### Phase 5: Public Website ✅
- ✅ Public homepage with event list
- ✅ Event details page
- ✅ Complete booking flow with forms and validation
- ✅ Payment pages for both Stripe and bank transfer
- ✅ Confirmation page with ticket download
- ✅ Rules & policy page with dynamic content
- ✅ Contacts page with organization info

**Files Created:**
- `frontend-new/index.html` - Homepage
- `frontend-new/event-details.html` - Event details
- `frontend-new/booking.html` - Booking form
- `frontend-new/payment-instructions.html` - Bank transfer instructions
- `frontend-new/confirmation.html` - Success page
- `frontend-new/rules.html` - Rules & policy
- `frontend-new/contacts.html` - Contact page
- `frontend-new/js/home.js` - Homepage logic
- `frontend-new/js/event-details.js` - Event details logic
- `frontend-new/js/booking.js` - Booking logic
- `frontend-new/js/payment-instructions.js` - Payment instructions
- `frontend-new/js/confirmation.js` - Confirmation logic
- `frontend-new/js/rules.js` - Policy loader
- `frontend-new/js/contacts.js` - Contact info loader
- `frontend-new/styles/main.css` - Global styles
- `frontend-new/js/config.js` - API configuration
- `frontend-new/js/utils.js` - Utility functions

### Phase 6: Integration & Testing ⏳
**Status**: Code complete, ready for testing

### Phase 7: Deployment ⏳
**Status**: Ready to deploy

### Phase 8: Documentation ✅
- ✅ Complete README with setup instructions
- ✅ API endpoint documentation
- ✅ Deployment guide

**Files Created:**
- `COMPLETE_REBUILD_README.md` - Full documentation
- `REBUILD_DEPLOYMENT_GUIDE.md` - This file

---

## 🚀 Deployment Steps

### Step 1: Deploy Database (Supabase)

1. **Login to Supabase**: https://supabase.com
2. **Create/Select Project**
3. **Run Schema Migration**:
   - Go to SQL Editor
   - Copy contents of `database/schema.sql`
   - Execute
4. **Run Seed Data**:
   - Copy contents of `database/seed.sql`
   - Execute
5. **Get Connection String**:
   - Go to Project Settings → Database
   - Copy the **Pooler** connection string (port 6543 recommended)
   - Format: `postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`

### Step 2: Deploy Backend (Railway)

1. **Login to Railway**: https://railway.app
2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
3. **Configure Settings**:
   - **Root Directory**: `backend-new`
   - **Start Command**: `npm start` (auto-detected)
4. **Add Environment Variables**:
   
   ```env
   PORT=3001
   NODE_ENV=production
   DATABASE_URL=postgresql://postgres.[ref]:[password]@[host]:6543/postgres
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=StudentEvents
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
   FRONTEND_URL=https://yourdomain.netlify.app
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Copy your Railway public URL (e.g., `https://your-app.up.railway.app`)

### Step 3: Update Frontend Configuration

Before deploying frontend, update the API URL:

**Edit `frontend-new/js/config.js`**:

```javascript
// API Configuration
const API_BASE_URL = 'https://your-backend.up.railway.app';  // Change this!

// Stripe Configuration (optional, can be loaded from backend)
const STRIPE_PUBLISHABLE_KEY = 'pk_live_xxxxxxxxxxxxxxxxxxxx';
```

### Step 4: Deploy Frontend (Netlify)

1. **Login to Netlify**: https://netlify.com
2. **Create New Site**:
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository
3. **Configure Build Settings**:
   - **Base directory**: `frontend-new`
   - **Build command**: (leave empty - static site)
   - **Publish directory**: `.` or `frontend-new`
4. **Deploy Site**:
   - Click "Deploy site"
   - Wait for deployment to complete
5. **Get Domain**:
   - Netlify will provide a subdomain (e.g., `your-site.netlify.app`)
   - You can configure custom domain in Domain settings

### Step 5: Update CORS Settings

**Update Backend CORS** to allow your Netlify domain:

In `backend-new/server.js`, verify CORS configuration:

```javascript
app.use(cors({
  origin: [
    'http://localhost:8000',
    'https://your-site.netlify.app',  // Add your Netlify domain
  ],
  credentials: true
}));
```

Redeploy backend after updating.

### Step 6: Configure Webhooks (Stripe)

1. **Stripe Dashboard**: https://dashboard.stripe.com/webhooks
2. **Add Endpoint**:
   - URL: `https://your-backend.up.railway.app/api/payments/webhook`
   - Events to send: `checkout.session.completed`, `payment_intent.succeeded`
3. **Copy Webhook Secret**:
   - Add to Railway environment variables as `STRIPE_WEBHOOK_SECRET`

### Step 7: Test Deployment

#### Test Public Website
1. ✅ Visit your Netlify URL
2. ✅ Browse events (should load from database)
3. ✅ Click on an event (details should load)
4. ✅ Create a test booking
5. ✅ Test Stripe payment (use test card: 4242 4242 4242 4242)
6. ✅ Test bank transfer flow
7. ✅ Check email delivery

#### Test Admin Panel
1. ✅ Visit `https://your-site.netlify.app/admin/login.html`
2. ✅ Login with: `admin@studentevents.com` / `Admin123!`
3. ✅ Create a new event
4. ✅ View bookings
5. ✅ Confirm a pending payment
6. ✅ Create a worker
7. ✅ Update settings

#### Test Worker Panel
1. ✅ Visit `https://your-site.netlify.app/worker/login.html`
2. ✅ Login with test worker credentials
3. ✅ Search for a ticket
4. ✅ Verify payment status

#### Test Supervisor Panel
1. ✅ Login as supervisor
2. ✅ View participant list
3. ✅ Confirm a payment manually

---

## 🔧 Post-Deployment Configuration

### Change Default Passwords

**CRITICAL**: Change default passwords immediately!

1. **Admin Password**:
   ```sql
   -- In Supabase SQL Editor
   UPDATE admin 
   SET password_hash = '$2a$10$your-new-bcrypt-hash'
   WHERE email = 'admin@studentevents.com';
   ```
   
   Or use the admin settings page to create new admin and delete default.

2. **Worker Passwords**:
   - Login to admin panel
   - Go to Workers section
   - Edit each worker and set new password

### Configure Settings

Login to admin panel and configure:

1. **Payment Method**:
   - Choose: Stripe or Bank Transfer
   - If bank transfer: Add bank details

2. **Contact Information**:
   - Support email
   - Support phone
   - Working hours

3. **Organization Details**:
   - Organization name
   - Contact email
   - Contact phone

4. **Policies** (optional):
   - Edit terms of service
   - Edit privacy policy
   - Edit event guidelines

### Configure Email Templates

Email templates are in `backend-new/services/email.js`. Customize:
- Email subject lines
- Email body text
- Company branding

### Set Up Monitoring

1. **Railway Monitoring**:
   - Enable logging
   - Set up alerts for errors
   - Monitor resource usage

2. **Netlify Monitoring**:
   - Check deployment logs
   - Monitor build status
   - Set up form notifications (if using)

3. **Supabase Monitoring**:
   - Monitor database size
   - Check query performance
   - Set up backups

---

## 📊 Database Management

### Regular Backups

**Supabase Auto-Backup** (enabled by default):
- Daily backups retained for 7 days
- Weekly backups retained for 4 weeks

**Manual Backup** (Admin Panel):
- Go to Settings → Data Management
- Click "Download Backup"
- Saves JSON file with all data

### Database Maintenance

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Vacuum tables (optimize)
VACUUM ANALYZE;
```

---

## 🐛 Troubleshooting Guide

### Issue: Backend 500 Errors

**Check**:
1. Railway logs for error messages
2. Database connection string is correct
3. All environment variables are set

**Solution**:
```bash
# In Railway logs, look for:
- "Database connection failed" → Check DATABASE_URL
- "JWT secret not defined" → Check JWT_SECRET
- "SendGrid error" → Check SENDGRID_API_KEY
```

### Issue: Frontend Can't Connect to Backend

**Check**:
1. API_BASE_URL in `config.js` is correct
2. CORS is configured in backend
3. Backend is actually running (check Railway)

**Solution**:
- Update `frontend-new/js/config.js` with correct Railway URL
- Verify CORS allows your Netlify domain
- Check browser console for CORS errors

### Issue: Emails Not Sending

**Check**:
1. SendGrid API key is valid
2. Sender email is verified in SendGrid
3. SendGrid account is not suspended

**Solution**:
- Verify API key in Railway environment variables
- Check SendGrid Activity log
- Ensure sender email is verified

### Issue: Payments Not Working

**Stripe Issues**:
- Check STRIPE_SECRET_KEY is correct
- Verify webhook endpoint is configured
- Test with Stripe test cards first

**Bank Transfer Issues**:
- Ensure bank details are configured in admin settings
- Check reference code generation logic

---

## 📈 Scaling Considerations

### Current Limitations
- Single server instance (Railway)
- Single database (Supabase free tier: 500MB, 2GB bandwidth)
- No caching layer

### When to Scale

**Upgrade Database** when:
- Database size > 400MB
- Active connections > 50
- Query response time > 1s

**Add Caching** when:
- API requests > 10,000/day
- Frequent repeated queries

**Add Load Balancer** when:
- Concurrent users > 500
- Backend response time > 2s

### Scaling Options

1. **Database**: Upgrade Supabase plan
2. **Backend**: Scale Railway instances
3. **Frontend**: Netlify auto-scales (no action needed)
4. **Caching**: Add Redis (Railway add-on)
5. **CDN**: Netlify CDN included

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All code tested locally
- [ ] Database schema finalized
- [ ] Environment variables documented
- [ ] API endpoints tested
- [ ] Frontend connected to backend

### Deployment
- [ ] Database deployed to Supabase
- [ ] Schema and seed data executed
- [ ] Backend deployed to Railway
- [ ] All environment variables added
- [ ] Backend is responding (health check)
- [ ] Frontend API URL updated
- [ ] Frontend deployed to Netlify
- [ ] CORS configured correctly
- [ ] Stripe webhook configured

### Post-Deployment
- [ ] Change default admin password
- [ ] Change default worker passwords
- [ ] Configure system settings
- [ ] Add real bank transfer details
- [ ] Test complete booking flow
- [ ] Test admin panel
- [ ] Test worker panel
- [ ] Verify email delivery
- [ ] Monitor logs for errors
- [ ] Set up backups
- [ ] Document custom domain setup (if applicable)

---

## 🎉 Deployment Complete!

Your StudentEvents platform is now live! 

**URLs**:
- Public Site: `https://your-site.netlify.app`
- Admin Panel: `https://your-site.netlify.app/admin/login.html`
- Worker Panel: `https://your-site.netlify.app/worker/login.html`
- Backend API: `https://your-backend.up.railway.app`

**Next Steps**:
1. Share URLs with stakeholders
2. Monitor initial usage
3. Collect feedback
4. Plan future enhancements

**Support**:
- Check logs regularly
- Monitor email delivery
- Track payment success rate
- Review database growth

---

*Last Updated: Rebuild Complete - All systems ready for deployment*

