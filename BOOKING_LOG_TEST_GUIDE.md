# 🧪 Booking Log Manual Testing Guide

## Test Environment Setup

### Step 1: Access New Admin Dashboard
**URL:** `https://your-domain.com/admin-dashboard-new.html`

**Expected:** Page loads with version 5.8.0 (check console)

### Step 2: Verify Console Logs
Open browser console (F12) and look for:

```
✅ Expected Console Output:
🔗 API URL set to: https://studentevents-production.up.railway.app/api
🔄 Cache version: 5.8.0
✅ Dashboard initialized
```

**❌ If you see:** `v=5.5.0` or old timestamps, the cache is still active.

## Test 1: Basic Page Loading

### Test Steps:
1. **Navigate to:** `admin-dashboard-new.html`
2. **Check console** for version 5.8.0
3. **Verify all tabs load** (Events, Bookings, Workers, Settings)

### Expected Results:
- ✅ Page loads without errors
- ✅ Console shows version 5.8.0
- ✅ All navigation tabs are clickable

## Test 2: Booking Log Loading

### Test Steps:
1. **Click on "Bookings" tab**
2. **Check console** for debug logs
3. **Look for 404 errors**

### Expected Console Output:
```
🔍 loadBookings - API_BASE_URL: https://studentevents-production.up.railway.app/api
🔍 loadBookings - Full URL: https://studentevents-production.up.railway.app/api/admin/bookings
✅ Loaded bookings: [number]
```

### ❌ **If you see 404 errors:**
```
GET https://studentevents-production.up.railway.app/admin/bookings 404 (Not Found)
```

**This means:** The API URL is still missing `/api` prefix.

## Test 3: API Endpoint Verification

### Manual API Test:
1. **Open new tab**
2. **Go to:** `https://studentevents-production.up.railway.app/api/admin/bookings`
3. **Check response**

### Expected Results:
- ✅ **200 OK** - Bookings data returned
- ❌ **404 Not Found** - Endpoint doesn't exist
- ❌ **401 Unauthorized** - Need authentication

## Test 4: Authentication Check

### Test Steps:
1. **Check if you're logged in** to admin dashboard
2. **Look for admin token** in localStorage
3. **Verify token is valid**

### Console Commands:
```javascript
// Check if logged in
console.log('Admin token:', localStorage.getItem('adminToken'));

// Test API call manually
fetch('https://studentevents-production.up.railway.app/api/admin/bookings', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    }
}).then(r => r.json()).then(console.log);
```

## Test 5: Booking Data Display

### Test Steps:
1. **Go to Bookings tab**
2. **Check if booking data loads**
3. **Verify filters work**
4. **Test booking actions**

### Expected Results:
- ✅ **Booking list displays** with data
- ✅ **Filters work** (Event, Status, Search)
- ✅ **Actions work** (Confirm, Cancel, Delete)
- ✅ **Auto-refresh works** (every 10 seconds)

## Troubleshooting Guide

### Issue 1: Still Getting 404 Errors
**Solution:** The API URL construction is still wrong.

**Check:** Console should show:
```
🔍 loadBookings - Full URL: https://studentevents-production.up.railway.app/api/admin/bookings
```

**If it shows:** `https://studentevents-production.up.railway.app/admin/bookings` (missing `/api`)

### Issue 2: Version Still 5.5.0
**Solution:** Browser cache is still active.

**Try:**
1. **Hard refresh:** Ctrl+F5
2. **Clear cache:** Ctrl+Shift+Delete
3. **Incognito mode:** Open in private window
4. **Different browser:** Try Chrome, Firefox, Edge

### Issue 3: Authentication Errors
**Solution:** Need to log in to admin dashboard.

**Steps:**
1. **Go to:** `/admin/login.html`
2. **Log in with admin credentials**
3. **Return to admin dashboard**

### Issue 4: No Bookings Data
**Solution:** Need to create test bookings first.

**Steps:**
1. **Go to main page**
2. **Create a test booking**
3. **Return to admin dashboard**
4. **Check Bookings tab**

## Success Criteria

### ✅ **Test Passes If:**
- Console shows version 5.8.0
- No 404 errors in console
- Bookings tab loads without errors
- Booking data displays (even if empty)
- All booking actions work
- Auto-refresh works

### ❌ **Test Fails If:**
- Console shows version 5.5.0
- 404 errors for `/admin/bookings`
- Bookings tab shows error messages
- No booking data displays
- Actions don't work

## Reporting Results

**Please report:**
1. **Console version** (should be 5.8.0)
2. **Any 404 errors** (copy exact error)
3. **API URL being called** (from debug logs)
4. **Booking data loads** (yes/no)
5. **Any other errors** (copy exact messages)

---

**Test Date:** [Your Date]  
**Browser:** [Your Browser]  
**Version:** 5.8.0  
**Status:** [Pass/Fail]
