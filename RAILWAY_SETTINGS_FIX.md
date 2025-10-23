# Railway Settings Fix Guide

## ⚙️ Correct Railway Settings

Based on your manual redeploy not working, the Railway project likely has **incorrect settings** that override the code configuration.

### Settings That MUST Be Correct:

1. **Root Directory:**
   - Location: Settings → General → Root Directory
   - **Must be:** EMPTY (blank) or `.` (single dot)
   - **NOT:** "backend", "backend-new", or anything else
   - **Why:** Railway needs to see the root to read railway.json/railway.toml

2. **Start Command:**
   - Location: Settings → Deploy → Start Command
   - **Option A (Recommended):** EMPTY (let railway.toml handle it)
   - **Option B:** `cd backend-new && node server.js`
   - **NOT:** "node railway-server.js" or "node server.js" (without cd)

3. **Build Command:**
   - Location: Settings → Deploy → Build Command  
   - **Option A (Recommended):** EMPTY (let railway.toml handle it)
   - **Option B:** `cd backend-new && npm ci --only=production`

4. **Watch Paths:** 
   - Location: Settings → Deploy → Watch Paths
   - **Should be:** EMPTY or `backend-new/**`
   - **NOT:** "backend/**"

5. **Builder:**
   - Location: Settings → Deploy → Builder
   - **Should be:** Auto-detect or NIXPACKS
   - **NOT:** Dockerfile (unless explicitly set to use our Dockerfile)

## 🔧 How to Fix

### Step 1: Clear All Custom Settings

1. Go to Railway → Project → **Settings** tab
2. Find each setting above
3. If it has a value, **DELETE IT** (leave blank)
4. Click **Save** for each change

### Step 2: Force Redeploy

After clearing settings:
1. Go to **Deployments** tab
2. Click **"⋯"** (three dots) on latest deployment
3. Click **"Redeploy"**
4. Wait 7 minutes

### Step 3: Check Build Logs

1. Click on the active deployment
2. Open **Build Logs**
3. **Look for these GOOD signs:**
   ```
   ✅ Detected railway.toml configuration
   ✅ Using NIXPACKS builder
   ✅ cd backend-new && npm ci --only=production
   ✅ Installing 198 packages
   ✅ cd backend-new && node server.js
   ✅ Server running on port 3001
   ✅ NEW-BACKEND-2.0.0
   ```

4. **BAD signs (means settings wrong):**
   ```
   ❌ Building from backend/
   ❌ node railway-server.js
   ❌ No railway.toml detected
   ❌ Using custom start command
   ```

## 🚫 Common Mistakes

### Mistake 1: Root Directory Set to "backend"
**Problem:** Railway looks for code in `backend/` which doesn't exist anymore
**Fix:** Delete Root Directory value, leave EMPTY

### Mistake 2: Custom Start Command
**Problem:** Custom commands override railway.toml configuration
**Fix:** Delete Start Command, let railway.toml handle it

### Mistake 3: Dockerfile Builder Selected
**Problem:** Might be using old Dockerfile cache
**Fix:** Change to "Auto-detect" or explicitly select "NIXPACKS"

## ✅ After Fixing Settings

1. **Redeploy** again
2. **Wait 7 minutes**
3. **Test:** `https://studentevents-production.up.railway.app/api/version`
   - Should show: `{"backend": "NEW-BACKEND", "version": "2.0.0"}`
4. **Test:** Create event in admin dashboard
   - Should work and save to database

## 🔄 If Still Not Working

If Railway still deploys old backend after fixing ALL settings:

### Nuclear Option: Delete and Recreate Service

1. **Backup environment variables:**
   - Go to Variables tab
   - Copy all variables to a text file

2. **Delete service:**
   - Settings → Danger Zone → Delete Service

3. **Create new service:**
   - New → Deploy from GitHub repo
   - Select `studentevents` repo
   - Select `main` branch
   - Railway will auto-detect Node.js

4. **Add environment variables back:**
   - Paste from backup

5. **Deploy:**
   - Should automatically use railway.toml config
   - Should deploy from backend-new

6. **Update frontend URL:**
   - Railway will give you new URL
   - Update `frontend-new/js/config.js` if URL changed

---

## 🎯 Alternative: Switch to Render

If Railway is completely broken, Render.com is easier:

1. Sign up: https://render.com
2. New Web Service → Connect GitHub
3. Settings:
   - Name: `studentevents-backend`
   - Root Directory: `backend-new`
   - Build: `npm install`
   - Start: `npm start`
4. Add environment variables (same as Railway)
5. Deploy (auto-deploys on every push)
6. Update frontend config with new Render URL

Render auto-detects everything and has better auto-deploy reliability than Railway.

---

## 📊 What to Tell Me

After checking Railway settings, tell me:

1. What was "Root Directory" set to?
2. What was "Start Command" set to?
3. What do you see in Build Logs after redeploy?
4. Do you want to try Render.com instead?

I'll guide you through the exact fix based on what you find.

