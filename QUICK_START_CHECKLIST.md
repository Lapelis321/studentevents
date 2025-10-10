# Quick Start Checklist - StudentEvents MVP

## 🎯 Goal
Transform your demo site into a fully functional ticketing platform with real payments in ~40 minutes.

---

## ✅ Step-by-Step Checklist

### Step 1: Database Setup (15 min)

#### Option A: Supabase (Recommended - Free)

- [ ] Go to https://supabase.com
- [ ] Sign up for free account
- [ ] Create new project
- [ ] Go to SQL Editor
- [ ] Open `backend/supabase-setup.sql` in your code editor
- [ ] Copy all SQL code
- [ ] Paste and run in Supabase SQL Editor
- [ ] Go to Project Settings → Database
- [ ] Copy the Connection String (URI format)
- [ ] Save it somewhere (you'll need it in Step 4)

**Your connection string looks like:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

---

### Step 2: Stripe Setup (10 min)

- [ ] Go to https://stripe.com
- [ ] Sign up for free account
- [ ] Go to Dashboard (you're in "Test Mode" by default)
- [ ] Click "Developers" → "API keys"
- [ ] Copy the **Publishable key** (starts with `pk_test_`)
- [ ] Click "Reveal test key" to see **Secret key** (starts with `sk_test_`)
- [ ] Save both keys somewhere

**Your keys look like:**
```
Publishable: pk_test_51ABC...xyz
Secret: sk_test_51ABC...xyz
```

---

### Step 3: SendGrid Setup (15 min)

- [ ] Go to https://sendgrid.com
- [ ] Sign up for free account (100 emails/day free)
- [ ] Verify your email address (check inbox)
- [ ] Go to Settings → API Keys
- [ ] Click "Create API Key"
- [ ] Name it "StudentEvents"
- [ ] Select "Full Access"
- [ ] Click "Create & View"
- [ ] **COPY THE KEY NOW** (starts with `SG.`) - you can't see it again!
- [ ] Save it somewhere
- [ ] Go to Settings → Sender Authentication
- [ ] Click "Verify a Single Sender"
- [ ] Enter your email address (e.g., `your-email@gmail.com`)
- [ ] Check your inbox and click verification link
- [ ] Wait for "Verified" status

**Your SendGrid key looks like:**
```
SG.abc123...xyz789
```

---

### Step 4: Add Environment Variables to Railway (5 min)

- [ ] Go to https://railway.app
- [ ] Log in to your account
- [ ] Click on your backend service
- [ ] Click "Variables" tab
- [ ] Click "+ New Variable" for each:

**Add these variables:**

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

STRIPE_SECRET_KEY=sk_test_your_secret_key_here

STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

SENDGRID_API_KEY=SG.your_api_key_here

FROM_EMAIL=your-verified-email@gmail.com

FROM_NAME=StudentEvents
```

- [ ] Click "Deploy" button to restart with new variables
- [ ] Wait for deployment to complete (~1-2 min)

---

### Step 5: Update Frontend Config (2 min)

#### File 1: `scripts/config-production.js`

- [ ] Open the file in your code editor
- [ ] Find line 4: `STRIPE_PUBLISHABLE_KEY: 'pk_test_51QRiazRrLGgfK3FJ...'`
- [ ] Replace `'pk_test_51QRiazRrLGgfK3FJ...'` with **your actual Stripe publishable key**
- [ ] Save the file

**Example:**
```javascript
STRIPE_PUBLISHABLE_KEY: 'pk_test_51ABC...xyz'  // ← Your real key here
```

#### File 2: `scripts/config.js`

- [ ] Open the file in your code editor
- [ ] Find line 26: `return 'pk_test_51QRiazRrLGgfK3FJ...';`
- [ ] Replace with **your actual Stripe publishable key**
- [ ] Find line 30: `return 'pk_test_51QRiazRrLGgfK3FJ...';`
- [ ] Replace with **your actual Stripe publishable key**
- [ ] Save the file

**Example:**
```javascript
if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'pk_test_51ABC...xyz';  // ← Your real key here
}
return 'pk_test_51ABC...xyz';  // ← Your real key here (same key)
```

---

### Step 6: Deploy Changes (2 min)

- [ ] Open terminal/command prompt
- [ ] Navigate to your project folder
- [ ] Run these commands:

```bash
git add .
git commit -m "Add Stripe publishable keys to frontend config"
git push origin main
```

- [ ] Wait for deployment (~2-3 min)
  - Railway will auto-deploy backend
  - Netlify will auto-deploy frontend

---

### Step 7: Test the System (10 min)

#### Test 1: Create Event

- [ ] Go to https://afterstateevents.netlify.app/admin
- [ ] Login with: `admin@studentevents.com` / `admin123`
- [ ] Create a test event
- [ ] Set price to 10 EUR
- [ ] Set available tickets to 5
- [ ] Save event

#### Test 2: Purchase Ticket

- [ ] Go to main page: https://afterstateevents.netlify.app
- [ ] Click on your test event
- [ ] Click "Buy Ticket"
- [ ] Fill in attendee information
- [ ] Use test card details:
  - **Card Number**: `4242 4242 4242 4242`
  - **Expiry**: `12/25` (any future date)
  - **CVC**: `123` (any 3 digits)
  - **ZIP**: `12345` (any 5 digits)
- [ ] Check "I agree to terms"
- [ ] Click "Proceed to Payment"

#### Test 3: Verify Success

- [ ] ✅ Check confirmation page shows QR code
- [ ] ✅ Check QR code displays properly
- [ ] ✅ Note the ticket number (e.g., `TKT-1234567890-ABC123`)
- [ ] ✅ Check your email inbox
- [ ] ✅ Verify email received with QR code
- [ ] ✅ Check Stripe dashboard shows payment

#### Test 4: Database Persistence

- [ ] Go to Railway dashboard
- [ ] Manually restart your backend service
- [ ] Go back to admin panel: https://afterstateevents.netlify.app/admin
- [ ] Refresh the page
- [ ] ✅ Verify event is still there (not lost)

---

## 🎉 Success!

If all tests pass, your system is **fully functional**!

You can now:
- ✅ Accept real credit card payments
- ✅ Generate QR code tickets
- ✅ Send confirmation emails
- ✅ Store data permanently
- ✅ Validate tickets with workers

---

## 🚨 Troubleshooting

### Card Input Not Showing

**Problem**: No card input field in checkout
**Fix**: 
1. Check `scripts/config.js` has correct Stripe key
2. Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for errors

### Payment Fails

**Problem**: "Payment failed" error
**Fix**:
1. Verify `STRIPE_SECRET_KEY` in Railway variables
2. Check Railway deployment logs for errors
3. Try test card again: `4242 4242 4242 4242`

### No Email Received

**Problem**: No confirmation email
**Fix**:
1. Check spam/junk folder
2. Verify sender email is verified in SendGrid
3. Check SendGrid dashboard → Activity
4. Verify `SENDGRID_API_KEY` in Railway

### QR Code Not Showing

**Problem**: Confirmation page doesn't show QR code
**Fix**:
1. Check if backend deployed successfully
2. Look at browser console for errors
3. Verify Stripe payment succeeded in Stripe dashboard

### Events Disappear

**Problem**: Events lost after server restart
**Fix**:
1. Verify `DATABASE_URL` is set in Railway
2. Check Railway logs for database connection errors
3. Test database connection in Supabase

---

## 📞 Need Help?

1. **Check Backend Logs**: Railway dashboard → Your service → Deployments → View logs
2. **Check Frontend Errors**: Browser → F12 → Console tab
3. **Verify API Keys**: Railway → Variables (check for typos)
4. **Test Services Individually**:
   - Database: Check Supabase dashboard
   - Stripe: Check Stripe dashboard → Payments
   - SendGrid: Check SendGrid dashboard → Activity

---

## 🚀 Going Live (When Ready)

### Switch from Test to Live Mode

1. **In Stripe Dashboard**:
   - Toggle from "Test Mode" to "Live Mode" (top right)
   - Go to Developers → API keys
   - Copy **Live** keys: `pk_live_...` and `sk_live_...`

2. **Update Railway Variables**:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

3. **Update Frontend Config**:
   - Change keys in `scripts/config.js`
   - Change keys in `scripts/config-production.js`

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Switch to Stripe live mode"
   git push origin main
   ```

5. **You're live!** 🎉

---

## ✅ Final Checklist

Before going live, ensure:

- [ ] All test payments work
- [ ] QR codes generate correctly
- [ ] Emails deliver successfully
- [ ] Data persists across restarts
- [ ] Mobile responsive
- [ ] Terms and conditions updated
- [ ] Privacy policy added
- [ ] Support email configured
- [ ] Refund policy defined
- [ ] Business registered (if required)
- [ ] Stripe account verified
- [ ] Bank account connected to Stripe

---

**Total Setup Time**: ~40 minutes

**Your MVP is ready to accept real payments!** 🚀

