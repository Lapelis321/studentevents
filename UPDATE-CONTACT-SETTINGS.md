# 🔧 Update Contact Settings - Step by Step

## Current Issue
Your contacts page shows **default values** instead of your saved values because the settings were saved with wrong database keys before the fix was deployed.

## Your Settings (From Admin Panel)
- ✅ Email: `afterstate.events@gmail.com`
- ✅ Phone: `+37063849474`
- ✅ Hours: `Mon - Sun 10:00 - 20:00`

## What Contacts Page Shows (Wrong)
- ❌ Email: `support@afterstate.events`
- ❌ Phone: `+370 600 00000`
- ❌ Hours: `Monday - Friday: 9:00 - 18:00`

---

## Solution: Re-Save Settings After Fix

### Step 1: Log into Admin Dashboard
1. Go to: https://afterstateevents.vercel.app/admin/login.html
2. Email: `admin@afterstate.events`
3. Password: `admin123`

### Step 2: Go to Settings Tab
1. Click "Settings" in the left sidebar
2. Scroll down to the contact sections

### Step 3: Re-Save Contact Settings
**In the "Contacts" section:**
1. Make sure these values are there:
   - Support Email: `afterstate.events@gmail.com`
   - Support Phone: `+37063849474`
   - Working Hours: `Mon - Sun 10:00 - 20:00`
2. **Click "Save Contact Settings"** button
3. ✅ You should see: "Contact settings saved" notification

### Step 4: Re-Save Organization Settings
**Scroll to "Organization" section:**
1. Make sure these values are there:
   - Organization Name: `Afterstate Events`
   - Contact Email: `afterstate.events@gmail.com`
   - Contact Phone: `+37063849474`
2. **Click "Save Organization Settings"** button
3. ✅ You should see: "Organization settings saved" notification

### Step 5: Verify on Contacts Page
1. Open: https://afterstateevents.vercel.app/contacts.html
2. **Hard refresh:** Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
3. ✅ Should now show:
   - Email Support: `afterstate.events@gmail.com`
   - Phone Support: `+37063849474`
   - Working Hours: `Mon - Sun 10:00 - 20:00`
   - Organization: `Afterstate Events`
   - Organization Email: `afterstate.events@gmail.com`
   - Organization Phone: `+37063849474`

---

## Why This Is Needed

**Before my fix:** Settings were saved with keys like `supportEmail` (camelCase)
**After my fix:** Settings save with keys like `support_email` (snake_case) - matching database schema

**You just need to re-save once** to migrate from the old format to the new format!

---

## If It Still Doesn't Work

Run this SQL in Supabase to check what's in the database:

```sql
-- Check current settings
SELECT key, value FROM settings 
WHERE category IN ('contact', 'organization')
ORDER BY key;
```

This will show if the settings have the correct keys or not.

