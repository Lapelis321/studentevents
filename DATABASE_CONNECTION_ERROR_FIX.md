# 🚨 DATABASE CONNECTION ERROR - URGENT FIX NEEDED

**Date:** October 11, 2025  
**Error:** "Tenant or user not found"  
**Status:** Railway backend cannot connect to Supabase database

---

## 🔍 Problem Identified

The API is working correctly, but when it tries to query the database, Supabase returns:

```json
{"error":"Failed to fetch events","details":"Tenant or user not found"}
```

This means the `DATABASE_URL` environment variable in Railway has an **authentication problem**.

---

## ✅ What's Working

- ✅ Frontend correctly calls the API
- ✅ Railway backend is running (`/api/health` returns healthy)
- ✅ Backend reports "database: connected"
- ❌ **But actual database queries fail with auth error**

---

## 🔧 Quick Fix (5 minutes)

### Step 1: Get New Connection String from Supabase

1. Go to: https://supabase.com/dashboard/project/vaoyiepnrizvvqokhcuu/settings/database
2. Scroll down to **"Connection string"** section
3. Click **"Connection pooling"** tab (NOT Direct connection)
4. Select **"Session mode"**
5. **IMPORTANT:** Make sure "Display connection pooler" is ON
6. You should see a connection string like:
   ```
   postgresql://postgres.vaoyiepnrizvvqokhcuu:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

### Step 2: Get Your Database Password

The connection string above will have `[YOUR-PASSWORD]` placeholder. You need to replace it with your actual password.

**If you forgot your password:**
1. In Supabase dashboard, go to Settings → Database
2. Click "Reset Database Password"
3. Copy the new password
4. Replace `[YOUR-PASSWORD]` in the connection string with the actual password

**Your password is:** `Sangilapas26ISM` (you provided this earlier)

So your full connection string should be:
```
postgresql://postgres.vaoyiepnrizvvqokhcuu:Sangilapas26ISM@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### Step 3: Update Railway Environment Variable

1. Go to: https://railway.app/project/studentevents
2. Click on your **backend service** (not frontend)
3. Go to **"Variables"** tab
4. Find `DATABASE_URL`
5. Click "Edit" and **replace** the value with the new connection string from Step 2
6. Click **"Save"** or **"Update"**
7. Railway will automatically redeploy (takes 1-2 minutes)

### Step 4: Test the Fix

Wait 2-3 minutes for Railway to redeploy, then:

1. Go to: https://studentevents-production.up.railway.app/api/events
2. Should see your events in JSON format (not an error)
3. Go to: https://afterstateevents.netlify.app
4. Should see your 4 events on the main page!

---

## 🎯 Expected Connection String Format

**✅ CORRECT (Session mode with pooler):**
```
postgresql://postgres.vaoyiepnrizvvqokhcuu:Sangilapas26ISM@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**❌ WRONG (Direct connection - doesn't work on Railway):**
```
postgresql://postgres:Sangilapas26ISM@db.vaoyiepnrizvvqokhcuu.supabase.co:5432/postgres
```

**Key differences:**
- ✅ Uses `pooler.supabase.com` (IPv4 compatible)
- ✅ Port is `6543` (not 5432)
- ✅ Uses `postgres.vaoyiepnrizvvqokhcuu` user format
- ❌ NOT `db.vaoyiepnrizvvqokhcuu.supabase.co` (IPv6 only)

---

## 🔍 How to Verify Current Connection String

You can check what Railway currently has:

1. Go to Railway dashboard
2. Click your backend service
3. Go to "Variables" tab
4. Look at `DATABASE_URL` value
5. Compare with the correct format above

---

## 💡 Why This Happened

Possible reasons:
1. **Password expired or changed** - Supabase reset your database password
2. **Wrong connection string mode** - Using direct connection instead of session pooler
3. **Typo in password** - Special characters not properly escaped
4. **Database user deleted** - Supabase project was reset or recreated

---

## 🆘 Alternative: Check Supabase Project Status

If updating the connection string doesn't work:

1. Go to Supabase dashboard
2. Check if your project is **paused** or **inactive**
3. Check if the database is **running** (green status)
4. Make sure the project ID is still `vaoyiepnrizvvqokhcuu`

---

## 🧪 Test Individual Steps

### Test 1: Verify Connection String Format
Your connection string should have these parts:
- Protocol: `postgresql://`
- User: `postgres.vaoyiepnrizvvqokhcuu`
- Password: `Sangilapas26ISM`
- Host: `aws-0-eu-central-1.pooler.supabase.com`
- Port: `6543`
- Database: `postgres`

### Test 2: Test Connection Locally
You can test the connection string locally:

```bash
cd backend
node -e "const {Pool}=require('pg'); const pool=new Pool({connectionString:'postgresql://postgres.vaoyiepnrizvvqokhcuu:Sangilapas26ISM@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',ssl:{rejectUnauthorized:false}}); pool.query('SELECT NOW()').then(r=>console.log('✅ Connected:',r.rows[0])).catch(e=>console.error('❌ Error:',e.message))"
```

---

## 📝 Quick Checklist

- [ ] Get Session mode connection string from Supabase
- [ ] Replace `[YOUR-PASSWORD]` with actual password
- [ ] Copy full connection string
- [ ] Go to Railway → Backend service → Variables
- [ ] Update `DATABASE_URL` with new connection string
- [ ] Wait 2-3 minutes for redeployment
- [ ] Test API endpoint: https://studentevents-production.up.railway.app/api/events
- [ ] Test main page: https://afterstateevents.netlify.app

---

## 🎉 Once Fixed

After the database connection is fixed, you should see:

1. ✅ API returns events: `https://studentevents-production.up.railway.app/api/events`
2. ✅ Main page shows 4 real events (not error message)
3. ✅ Creating events in admin appears on main page
4. ✅ Deleting events in admin removes from main page

---

## 🔗 Helpful Links

- Supabase Dashboard: https://supabase.com/dashboard/project/vaoyiepnrizvvqokhcuu/settings/database
- Railway Dashboard: https://railway.app/project/studentevents
- Backend Health Check: https://studentevents-production.up.railway.app/api/health
- Backend Events API: https://studentevents-production.up.railway.app/api/events
- Frontend Main Page: https://afterstateevents.netlify.app

---

**Priority:** 🔴 CRITICAL - Site is currently down, needs immediate fix!

