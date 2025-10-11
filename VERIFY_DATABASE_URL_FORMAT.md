# 🔍 VERIFY DATABASE_URL FORMAT - URGENT

**Current Status:** Railway redeployed (uptime: 1.7 minutes) but still getting "Tenant or user not found" error.

---

## ❌ Problem

The error "Tenant or user not found" means the connection string format or credentials are incorrect.

Railway shows `"database": "connected"` in health check, but queries fail. This suggests:
- The connection string **format** is correct enough to connect
- But the **credentials** (username, password, or database name) are wrong

---

## ✅ What To Check In Railway

### Step 1: Go to Railway Dashboard
1. Open: https://railway.app/
2. Click your project
3. Click your **backend service**
4. Go to **"Variables"** tab

### Step 2: Find DATABASE_URL
Look for the `DATABASE_URL` variable and check if it matches **EXACTLY** this format:

```
postgresql://postgres.vaoyiepnrizvvqokhcuu:Sangilapas26ISM@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

---

## 🔍 Common Mistakes

### ❌ Wrong Username Format
```
postgresql://postgres:[PASSWORD]@...
```
Should be:
```
postgresql://postgres.vaoyiepnrizvvqokhcuu:[PASSWORD]@...
```

### ❌ Wrong Host (Direct Connection)
```
...@db.vaoyiepnrizvvqokhcuu.supabase.co:5432/...
```
Should be:
```
...@aws-0-eu-central-1.pooler.supabase.com:6543/...
```

### ❌ Wrong Port
```
...:5432/postgres
```
Should be:
```
...:6543/postgres
```

### ❌ Still Has Placeholder
```
postgresql://postgres.vaoyiepnrizvvqokhcuu:[YOUR-PASSWORD]@...
```
Should be:
```
postgresql://postgres.vaoyiepnrizvvqokhcuu:Sangilapas26ISM@...
```

---

## 📋 Checklist - Verify Each Part

Break down the connection string and verify each part:

### Part 1: Protocol
```
postgresql://
```
✅ This should always be `postgresql://`

### Part 2: Username
```
postgres.vaoyiepnrizvvqokhcuu
```
✅ NOT just `postgres`
✅ Must include `.vaoyiepnrizvvqokhcuu`

### Part 3: Password
```
:Sangilapas26ISM
```
✅ Starts with colon `:`
✅ Your password (the one you provided earlier)

### Part 4: Host
```
@aws-0-eu-central-1.pooler.supabase.com
```
✅ Starts with `@`
✅ Must include `.pooler.supabase.com`
✅ NOT `db.vaoyiepnrizvvqokhcuu.supabase.co`

### Part 5: Port
```
:6543
```
✅ Must be `6543` for pooler
✅ NOT `5432` (that's for direct connection)

### Part 6: Database Name
```
/postgres
```
✅ Starts with `/`
✅ Database name is `postgres`

---

## 🎯 EXACT String To Use

Copy this **EXACT** string and paste it into Railway's `DATABASE_URL`:

```
postgresql://postgres.vaoyiepnrizvvqokhcuu:Sangilapas26ISM@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

---

## 🔄 After Updating

1. **Save** the variable in Railway
2. Railway will automatically redeploy (takes 1-2 minutes)
3. **Wait 2-3 minutes**
4. Test again: https://studentevents-production.up.railway.app/api/events
5. Should see JSON array of events (not an error)

---

## 🆘 If Still Not Working

### Option 1: Get Fresh Connection String from Supabase

1. Go back to Supabase dashboard
2. In the "Connect" dialog, look for **"Transaction pooler"** section
3. Select **"Session"** mode
4. Copy the connection string
5. It will have `[YOUR-PASSWORD]` - replace with `Sangilapas26ISM`
6. Paste into Railway

### Option 2: Check Password is Correct

1. In Supabase, go to Settings → Database
2. Click "Reset database password"
3. Copy the NEW password
4. Update your connection string with the new password
5. Update Railway `DATABASE_URL`

### Option 3: Test Connection Locally

You can test the connection string from your computer:

```bash
cd backend
node -e "const {Pool}=require('pg'); const pool=new Pool({connectionString:'postgresql://postgres.vaoyiepnrizvvqokhcuu:Sangilapas26ISM@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',ssl:{rejectUnauthorized:false}}); pool.query('SELECT NOW()').then(r=>console.log('✅ Connected:',r.rows[0])).catch(e=>console.error('❌ Error:',e.message)).finally(()=>process.exit())"
```

If this works, the connection string is correct!

---

## 📸 Take a Screenshot

If you're still having issues, take a screenshot of:
1. The Railway Variables tab showing the `DATABASE_URL` value
2. The Supabase Connect dialog showing the connection string

This will help me see exactly what's configured.

---

**Current Error:** `"Tenant or user not found"`  
**Most Likely Cause:** Wrong username format or password  
**Solution:** Use the exact string above with `postgres.vaoyiepnrizvvqokhcuu` (not just `postgres`)

