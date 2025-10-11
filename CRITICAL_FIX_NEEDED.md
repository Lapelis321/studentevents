# CRITICAL: Database Connection Fix Needed

## Problem
Railway cannot connect to Supabase via IPv6. Error:
```
connect ENETUNREACH 2a05:d016:571:a426:ba2b:4b1c:5b47:5002:5432
```

## Solution
You need to update the DATABASE_URL in Railway to use IPv4/Supavisor connection.

## Steps to Fix:

### 1. Get the Correct Connection String from Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/vaoyiepnrizvvqokhcuu/settings/database
2. Scroll to **"Connection string"**
3. **IMPORTANT:** Select the **"Session mode"** tab (NOT "URI")
4. Copy the connection string (it will have a different host that supports IPv4)
5. Replace `[YOUR-PASSWORD]` with: `Sangilapas26ISM`

### 2. Update Railway Environment Variable

1. Go to Railway: https://railway.app/dashboard
2. Click **"studentevents"** project
3. Click **"Variables"** tab
4. **Edit** the `DATABASE_URL` variable
5. **Replace the old value** with the new "Session mode" connection string
6. Save

### Expected Result
The new connection string will look like:
```
postgresql://postgres.vaoyiepnrizvvqokhcuu:Sangilapas26ISM@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

Note the different host: `aws-0-eu-central-1.pooler.supabase.com` instead of `db.vaoyiepnrizvvqokhcuu.supabase.co`

This uses Supavisor (connection pooler) which supports IPv4.

## After You Update:
Railway will auto-redeploy and the database will work!

Tell me: "DATABASE_URL updated with Session mode"

