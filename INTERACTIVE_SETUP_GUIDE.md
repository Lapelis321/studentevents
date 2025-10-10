# 🚀 Interactive Setup Guide - Complete Your MVP Launch

**Current Status**: ✅ Code 100% Complete | ⏳ Awaiting Your API Setup  
**Time Required**: 40-50 minutes  
**Goal**: Activate real payments, database persistence, and email notifications

---

## 📋 Overview of Remaining Tasks

These tasks **require your personal accounts and API keys**. I cannot automate them, but I'll guide you through each step.

### Task Status
- ✅ **Code Implementation**: 100% Complete (all done!)
- ⏳ **Task 1**: Set up PostgreSQL database (15 min) - **YOU DO THIS**
- ⏳ **Task 2**: Configure Stripe payments (10 min) - **YOU DO THIS**
- ⏳ **Task 3**: Set up SendGrid emails (15 min) - **YOU DO THIS**
- ⏳ **Task 4**: Add environment variables (5 min) - **YOU DO THIS**
- ⏳ **Task 5**: Test the system (10 min) - **WE DO TOGETHER**

---

## 🎯 Task 1: Database Setup (15 minutes)

### Why You Need This
Currently, your events are stored in memory and **disappear when the server restarts**. A database makes everything permanent.

### Option A: Supabase (Recommended - Easiest)

#### Step 1.1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. ✅ Free tier includes: 500MB database, unlimited API requests

#### Step 1.2: Create New Project
1. Click "New Project"
2. Fill in:
   - **Name**: `studentevents` (or your choice)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
3. Click "Create new project"
4. ⏳ Wait 2-3 minutes for setup

#### Step 1.3: Run Database Migrations
1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Open your local file: `backend/supabase-setup.sql`
3. Copy **ALL** the SQL code
4. Paste into Supabase SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. ✅ You should see: "Success. No rows returned"

**What this does**: Creates 4 tables:
- `events` - Your events
- `tickets` - Purchased tickets with QR codes
- `admins` - Admin accounts
- `workers` - Worker accounts for scanning

#### Step 1.4: Get Connection String
1. In Supabase, click "Project Settings" (gear icon)
2. Click "Database" in left menu
3. Scroll to "Connection string"
4. Select "URI" tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abc123xyz.supabase.co:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]` with the password you created in Step 1.2**
7. 💾 **SAVE THIS STRING** - You'll need it in Task 4

### Option B: Railway Postgres (Alternative)

#### If You Prefer Railway:
1. Go to Railway dashboard
2. Click "+ New"
3. Select "Database" → "PostgreSQL"
4. Railway creates `DATABASE_URL` automatically
5. Click the database → "Connect" → Copy the connection string
6. Open Railway's database query tool
7. Paste and run contents of `backend/supabase-setup.sql`

---

## 💳 Task 2: Stripe Payment Setup (10 minutes)

### Why You Need This
This enables **real credit card payments** for ticket purchases.

#### Step 2.1: Create Stripe Account
1. Go to https://stripe.com
2. Click "Start now" or "Sign up"
3. Fill in:
   - **Email**: Your email
   - **Full name**: Your name
   - **Country**: Your country
4. Verify email
5. ✅ You're automatically in **Test Mode** (perfect for MVP!)

#### Step 2.2: Get Test API Keys
1. In Stripe Dashboard, click "Developers" (top right)
2. Click "API keys"
3. You'll see two keys:

**Publishable Key** (starts with `pk_test_`):
```
pk_test_51QRiazRrLGgfK3FJ...
```
- This goes in your **frontend** code
- Safe to expose publicly
- 💾 **COPY THIS**

**Secret Key** (starts with `sk_test_`):
```
sk_test_51QRiazRrLGgfK3FJ...
```
- Click "Reveal test key"
- This goes in your **backend** environment variables
- Keep this SECRET!
- 💾 **COPY THIS**

#### Step 2.3: Test Cards for Testing
When testing, use these cards:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)

---

## 📧 Task 3: SendGrid Email Setup (15 minutes)

### Why You Need This
Automatically send ticket confirmation emails with QR codes.

#### Step 3.1: Create SendGrid Account
1. Go to https://sendgrid.com
2. Click "Start for free" or "Sign Up"
3. Fill in registration form
4. Verify your email address
5. ✅ Free tier: 100 emails/day (perfect for MVP!)

#### Step 3.2: Create API Key
1. In SendGrid dashboard, hover over "Settings" (left sidebar)
2. Click "API Keys"
3. Click "Create API Key"
4. Fill in:
   - **API Key Name**: `StudentEvents Production`
   - **API Key Permissions**: Select "Full Access"
5. Click "Create & View"
6. 💾 **COPY THE API KEY** (starts with `SG.`)
   ```
   SG.abc123xyz...
   ```
7. ⚠️ **CRITICAL**: You can ONLY see this key ONCE! Save it now!

#### Step 3.3: Verify Sender Email
**IMPORTANT**: SendGrid won't send emails until you verify a sender address.

1. In SendGrid, go to "Settings" → "Sender Authentication"
2. Click "Get Started" under "Verify a Single Sender"
3. Fill in the form:
   - **From Name**: `StudentEvents`
   - **From Email**: Your email (e.g., `your-email@gmail.com`)
   - **Reply To**: Same email
   - **Company**: `StudentEvents` (or your company)
   - **Address**, **City**, **Country**: Your real address
4. Click "Create"
5. Check your email inbox
6. Click the verification link
7. ✅ Wait for "Verified" status

**Note**: For production, you'd use a custom domain like `noreply@studentevents.com`, but your personal email works for testing!

---

## ⚙️ Task 4: Add Environment Variables (5 minutes)

Now you'll add all your API keys to Railway and update frontend config.

### Step 4.1: Railway Backend Variables

1. Go to https://railway.app
2. Click your backend service
3. Click "Variables" tab
4. Click "+ New Variable" for each:

**Add These Variables**:
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xyz.supabase.co:5432/postgres
# ↑ Your Supabase connection string from Task 1

STRIPE_SECRET_KEY=sk_test_51QRiazRrLGgfK3FJ...
# ↑ Your Stripe SECRET key from Task 2

STRIPE_PUBLISHABLE_KEY=pk_test_51QRiazRrLGgfK3FJ...
# ↑ Your Stripe PUBLISHABLE key from Task 2

SENDGRID_API_KEY=SG.abc123xyz...
# ↑ Your SendGrid API key from Task 3

FROM_EMAIL=your-email@gmail.com
# ↑ The email you verified in SendGrid

FROM_NAME=StudentEvents
# ↑ Name shown in emails
```

5. After adding all variables, click the deploy icon or wait for auto-deploy

### Step 4.2: Update Frontend Config Files

**Option 1: Using Cursor/Editor**

Open these files and update:

**File: `scripts/config.js`** (lines 26 & 30)
```javascript
// Line 26 - Local development
return 'pk_test_51QRiazRrLGgfK3FJ...'; // Replace with YOUR key

// Line 30 - Production
return 'pk_test_51QRiazRrLGgfK3FJ...'; // Replace with YOUR key
```

**File: `scripts/config-production.js`** (line 4)
```javascript
STRIPE_PUBLISHABLE_KEY: 'pk_test_51QRiazRrLGgfK3FJ...' // Replace with YOUR key
```

**Option 2: Using Terminal**

I can help you update these files if you provide your Stripe publishable key!

### Step 4.3: Deploy Frontend Changes

After updating config files:
```bash
git add scripts/config.js scripts/config-production.js
git commit -m "Add Stripe publishable key"
git push origin main
```

Netlify will auto-deploy in ~2 minutes.

---

## ✅ Task 5: Test Everything (10 minutes)

### Test 1: Database Persistence ✅
1. Go to https://afterstateevents.netlify.app/admin
2. Login: `admin@studentevents.com` / `admin123`
3. Create a new test event
4. Go to Railway dashboard → Restart your service
5. Go back to admin panel → Refresh
6. ✅ **SUCCESS**: Event should still be there!

### Test 2: Real Payment Flow ✅
1. Go to https://afterstateevents.netlify.app
2. Click on any active event
3. Click "Buy Ticket"
4. Fill in attendee information
5. Use test card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - ZIP: `12345`
6. Click "Proceed to Payment"
7. ✅ **SUCCESS**: Payment should process!

### Test 3: QR Code Generation ✅
1. After successful payment
2. You should see confirmation page
3. ✅ **SUCCESS**: QR code should be displayed!

### Test 4: Email Delivery ✅
1. Check your email inbox (the one you used in checkout)
2. Look for email from SendGrid
3. ✅ **SUCCESS**: Email with QR code ticket!

**If email doesn't arrive**:
- Check spam folder
- Verify sender email in SendGrid
- Check SendGrid activity log

---

## 🎯 Success Checklist

After completing all tasks, verify:

- [ ] Database connected (events persist after restart)
- [ ] Stripe payments working (test card processes)
- [ ] QR codes generating (shown on confirmation page)
- [ ] Emails sending (received confirmation email)
- [ ] No errors in Railway logs
- [ ] No errors in browser console

---

## 🐛 Troubleshooting

### Issue: "Database connection failed"
**Fix**: Check DATABASE_URL in Railway variables
- Verify password is correct
- Test connection in Supabase

### Issue: "Stripe not configured"
**Fix**: Check Stripe keys in Railway AND frontend
- Backend needs: `STRIPE_SECRET_KEY`
- Frontend needs: publishable key in config files

### Issue: "Payment failed"
**Fix**: 
- Use test card: 4242 4242 4242 4242
- Check Stripe Dashboard → Logs
- Verify keys are correct

### Issue: "No email received"
**Fix**:
- Check spam folder
- Verify sender email in SendGrid
- Check SendGrid Activity log
- Verify `FROM_EMAIL` matches verified email

### Issue: "Events disappearing"
**Fix**: DATABASE_URL not set correctly
- Restart Railway service after adding variable
- Check Railway logs for connection errors

---

## 📞 Need Help?

### Check Logs
**Backend**: Railway dashboard → Your service → Deployments → Logs
**Frontend**: Browser F12 → Console tab

### Test Individual Services
1. **Database**: Query in Supabase SQL editor
2. **Stripe**: Check Dashboard → Payments
3. **SendGrid**: Check Activity log

---

## 🎉 What Happens After Setup

Once you complete all tasks, your system will:

✅ **Accept Real Payments**: Customers can buy tickets with credit cards  
✅ **Generate QR Codes**: Each ticket gets a unique, scannable QR code  
✅ **Send Emails**: Automatic confirmation emails with tickets  
✅ **Store Data**: Everything saved permanently in database  
✅ **Track Sales**: See real revenue in Stripe dashboard  
✅ **Scan Tickets**: Workers can validate QR codes at events  

---

## 🚀 Going Live (When Ready)

To switch from test mode to accepting real money:

### In Stripe:
1. Complete business verification
2. Add bank account for payouts
3. Switch from "Test Mode" to "Live Mode"
4. Get LIVE API keys (start with `pk_live_` and `sk_live_`)
5. Update environment variables with live keys

### In Your App:
1. Update Railway variables with live Stripe keys
2. Update frontend config with live publishable key
3. Test with real (small amount) payment
4. Monitor first few transactions closely

---

## 📊 Quick Reference

| Service | What It Does | Free Tier | Upgrade At |
|---------|--------------|-----------|------------|
| Supabase | Database storage | 500MB | 1GB+ data |
| Stripe | Payment processing | Unlimited (2.9% + 30¢ fee) | Never (pay per use) |
| SendGrid | Email delivery | 100/day | 100+ emails/day |
| Railway | Backend hosting | 500 hrs/month | High traffic |
| Netlify | Frontend hosting | Unlimited | Custom domain |

---

## ✨ You're Almost There!

You've built an **amazing** ticketing platform. These final setup steps will bring it to life!

**Estimated Time**: 40-50 minutes  
**Difficulty**: Easy (just following steps)  
**Result**: Fully functional ticketing business 🎉

**Let's start with Task 1 (Database). Would you like me to guide you through it step-by-step?**

