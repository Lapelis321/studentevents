# Environment Setup Guide - StudentEvents MVP Launch

This guide will walk you through setting up the required services and environment variables for the fully functional ticketing system.

## Overview

You need to set up:
1. ✅ **PostgreSQL Database** (Supabase OR Railway Postgres)
2. ✅ **Stripe Payment Processing** (for real payments)
3. ✅ **SendGrid Email Service** (for ticket confirmations)

---

## 1. PostgreSQL Database Setup

### Option A: Supabase (Recommended - Free Tier)

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up for free account
   - Create a new project

2. **Run Database Migrations**
   - In Supabase Dashboard, go to "SQL Editor"
   - Open the file `backend/supabase-setup.sql`
   - Copy all the SQL code and run it in Supabase SQL Editor
   - This creates the `events`, `tickets`, `admins`, and `workers` tables

3. **Get Connection String**
   - Go to Project Settings → Database
   - Copy the "Connection String" (URI format)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`

### Option B: Railway Postgres

1. **Add Postgres to Railway Project**
   - In Railway dashboard, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create a `DATABASE_URL` variable

2. **Run Migrations**
   - Connect to the database using the Railway CLI or a tool like pgAdmin
   - Run the SQL from `backend/supabase-setup.sql`

### Add to Railway Environment

Once you have your database connection string:

1. Go to Railway dashboard → Your backend service
2. Click "Variables" tab
3. Add new variable:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```
4. Click "Deploy" to restart with new variable

---

## 2. Stripe Payment Processing Setup

### Create Stripe Account

1. **Sign Up for Stripe**
   - Go to https://stripe.com
   - Sign up for free account
   - You'll start in "Test Mode" (perfect for MVP testing)

2. **Get API Keys**
   - In Stripe Dashboard, go to "Developers" → "API keys"
   - You'll see two keys:
     - **Publishable key** (starts with `pk_test_`)
     - **Secret key** (starts with `sk_test_`)
   - Click "Reveal test key" to see the secret key

3. **Get Webhook Secret (Optional for MVP)**
   - Go to "Developers" → "Webhooks"
   - Click "+ Add endpoint"
   - Endpoint URL: `https://your-railway-url.up.railway.app/webhook/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Save and copy the "Signing secret" (starts with `whsec_`)

### Add to Railway Environment

1. Go to Railway dashboard → Your backend service
2. Click "Variables" tab
3. Add these variables:
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```
4. Click "Deploy"

### Update Frontend Config

1. **Update Production Config**
   Edit `scripts/config-production.js`:
   ```javascript
   STRIPE_PUBLISHABLE_KEY: 'pk_test_your_publishable_key_here'
   ```

2. **Update Local Config**
   Edit `scripts/config.js` (lines 25-30):
   ```javascript
   if (hostname === 'localhost' || hostname === '127.0.0.1') {
       return 'pk_test_your_publishable_key_here';
   }
   return 'pk_test_your_publishable_key_here';
   ```

---

## 3. SendGrid Email Service Setup

### Create SendGrid Account

1. **Sign Up for SendGrid**
   - Go to https://sendgrid.com
   - Sign up for free account (includes 100 emails/day free)
   - Verify your email address

2. **Create API Key**
   - In SendGrid Dashboard, go to "Settings" → "API Keys"
   - Click "Create API Key"
   - Name it "StudentEvents Production"
   - Select "Full Access" permissions
   - Copy the API key (starts with `SG.`)
   - **IMPORTANT**: Save this key immediately - you can't see it again!

3. **Verify Sender Email (Required)**
   - Go to "Settings" → "Sender Authentication"
   - Choose "Verify a Single Sender"
   - Enter your email address (e.g., `noreply@yourdomain.com` or your personal email)
   - SendGrid will send verification email
   - Click the link in the email to verify

### Add to Railway Environment

1. Go to Railway dashboard → Your backend service
2. Click "Variables" tab
3. Add these variables:
   ```
   SENDGRID_API_KEY=SG.your_api_key_here
   FROM_EMAIL=your-verified-email@domain.com
   FROM_NAME=StudentEvents
   ```
4. Click "Deploy"

---

## 4. Test Your Setup

### Test Stripe Payments

Use these test card numbers in checkout:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

### Test Email Delivery

1. Create a test event in admin panel
2. Purchase a ticket using test card
3. Check your email inbox (the email you used in checkout)
4. You should receive:
   - Email with QR code ticket
   - Ticket number
   - Event details

### Test Database Persistence

1. Create an event in admin panel
2. Restart your Railway backend service
3. Refresh admin panel
4. Event should still be there (not lost)

---

## 5. Deploy to Production

Once all services are configured:

### Backend (Railway)

1. Commit all changes:
   ```bash
   git add .
   git commit -m "Phase 1 MVP: Full payment integration complete"
   git push origin main
   ```

2. Railway will auto-deploy
3. Check deployment logs for any errors
4. Test the `/health` endpoint: `https://your-railway-url.up.railway.app/health`

### Frontend (Netlify)

1. Netlify will auto-deploy when you push to GitHub
2. Clear Netlify cache if needed:
   - Go to Netlify dashboard
   - Site Settings → Build & Deploy → Clear cache and deploy site

3. Test the deployed site: `https://afterstateevents.netlify.app`

---

## 6. Going Live with Real Payments

When you're ready to accept real payments:

### In Stripe Dashboard

1. Complete Stripe account verification (business details, bank account)
2. Switch from "Test Mode" to "Live Mode" (toggle in top right)
3. Get your **Live API keys**:
   - Go to "Developers" → "API keys"
   - Copy `pk_live_...` and `sk_live_...`

### Update Environment Variables

1. **Railway Backend**:
   ```
   STRIPE_SECRET_KEY=sk_live_your_live_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   ```

2. **Frontend Config** (`scripts/config-production.js`):
   ```javascript
   STRIPE_PUBLISHABLE_KEY: 'pk_live_your_live_key'
   ```

3. Commit and deploy changes

---

## 7. Environment Variables Checklist

### Railway Backend Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_... (optional)

# SendGrid
SENDGRID_API_KEY=SG....
FROM_EMAIL=your-email@domain.com
FROM_NAME=StudentEvents

# Frontend URL (already set)
FRONTEND_URL=https://afterstateevents.netlify.app
```

### Frontend Config Files

- `scripts/config.js` - Update Stripe publishable key
- `scripts/config-production.js` - Update Stripe publishable key

---

## 8. Troubleshooting

### Payments Not Working

- ✅ Check Stripe API keys are correct in Railway
- ✅ Check frontend has correct publishable key
- ✅ Check browser console for errors
- ✅ Verify Stripe Dashboard shows the payment attempt

### Emails Not Sending

- ✅ Verify SendGrid API key is active
- ✅ Verify sender email is verified in SendGrid
- ✅ Check SendGrid activity log
- ✅ Check spam folder

### Database Connection Errors

- ✅ Verify DATABASE_URL is correct
- ✅ Check database server is running
- ✅ Test connection with a PostgreSQL client
- ✅ Check Railway logs for connection errors

### QR Codes Not Showing

- ✅ Check backend successfully generated tickets
- ✅ Check orderData in sessionStorage has `tickets` array
- ✅ Check browser console for image loading errors

---

## 9. Next Steps (Optional Enhancements)

After MVP is working:

1. **User Authentication**: Allow users to create accounts
2. **My Tickets Page**: Users can view purchased tickets
3. **Ticket Transfer**: Allow ticket transfers between users
4. **Analytics Dashboard**: Track sales, popular events
5. **Discount Codes**: Promo code system
6. **Waitlist**: For sold-out events
7. **Social Sharing**: Share events on social media

---

## Support

If you encounter issues:

1. Check Railway deployment logs
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Test each service individually (database, Stripe, SendGrid)

**The system is designed to work even if some services aren't configured:**
- Without database: Uses in-memory storage (data lost on restart)
- Without Stripe: Falls back to demo mode
- Without SendGrid: Skips email sending but continues

This allows you to gradually enable features as you set them up!

