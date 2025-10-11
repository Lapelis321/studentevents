# 🔗 How to Get the Correct Supabase Connection String

## ⚠️ THE REAL PROBLEM

The username format for Supabase's connection pooler is **very specific** and we've been guessing it wrong.

You need to get the **EXACT** connection string from Supabase's dashboard.

---

## 📋 **Step-by-Step Instructions**

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/vaoyiepnrizvvqokhcuu/settings/database

### 2. Click "Connect" Button
At the top right of the page, there's a green "Connect" button - click it.

### 3. Find the "Connection Pooling" or "Pooling" Tab
In the dialog that opens, you'll see tabs like:
- Connection String
- App Frameworks
- **Connection Pooling** ← Click this one

### 4. Select "Session" Mode
There should be a dropdown or tabs showing "Transaction" and "Session".
- Click **"Session"**

### 5. Find the Connection String
You'll see a connection string that looks like:
```
postgresql://postgres.vaoyiepnrizvvqokhcuu:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 6. Copy the ENTIRE String
- Click the copy button next to it
- **OR** manually select and copy the entire string

### 7. Replace the Password
In the copied string, you'll see `[YOUR-PASSWORD]` - replace it with:
```
Sangilapas26After
```

### 8. The Final String Should Look Like:
```
postgresql://postgres.vaoyiepnrizvvqokhcuu:Sangilapas26After@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**OR** it might have a slightly different format - **just use whatever Supabase shows you!**

---

## 🎯 **Paste This Into Railway**

Once you have the correct connection string:

1. Go to Railway
2. Click your backend service
3. Go to "Variables" tab
4. Find `DATABASE_URL`
5. **Paste the ENTIRE string** (with your password)
6. Save
7. Redeploy
8. Wait 2 minutes
9. Test!

---

## 🆘 **Can't Find Connection Pooling Tab?**

If you don't see a "Connection Pooling" tab in the Connect dialog, try this:

1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **"Connection string"** section
3. Look for a dropdown that says "Connection pooling" or similar
4. Select **"Session mode"**
5. Copy the connection string shown there

---

## ✅ **The Key Point**

Whatever connection string Supabase shows you in the **"Connection Pooling - Session mode"** section is the CORRECT one.

Don't modify it except to replace `[YOUR-PASSWORD]` with `Sangilapas26After`.

---

**Just copy-paste the exact string from Supabase!** 🚀

