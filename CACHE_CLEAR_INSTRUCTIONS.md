# 🔄 Manual Cache Clearing Instructions

## Problem
The booking log is failing to load because your browser is aggressively caching old JavaScript files (version 5.5.0) instead of loading the updated version (5.7.0) that contains the fix.

## Solution: Force Browser to Load New Code

### Method 1: Hard Refresh (Quickest)
1. **Go to the admin dashboard page**
2. **Press `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)**
3. **Check console** - should now show `v=5.7.0` instead of `v=5.5.0`

### Method 2: Clear Browser Cache (Most Reliable)
1. **Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)**
2. **Select "Cached images and files"**
3. **Click "Clear data"**
4. **Refresh the page**

### Method 3: Incognito/Private Mode (Bypass Cache)
1. **Open a new incognito/private window**
2. **Go to the admin dashboard**
3. **Check if bookings load correctly**

### Method 4: Different Browser
1. **Try opening the admin dashboard in a different browser**
2. **This completely bypasses any cache issues**

## Verification Steps

After clearing cache, you should see:

### ✅ Console Logs (F12 → Console)
```
🔄 Cache version: 5.7.0
🔍 loadBookings - API_BASE_URL: https://studentevents-production.up.railway.app/api
🔍 loadBookings - Full URL: https://studentevents-production.up.railway.app/api/admin/bookings
✅ Loaded bookings: [number]
```

### ✅ Script Versions
- Should show `admin-dashboard.js?v=5.7.0` instead of `v=5.5.0`
- Should show `t=1736710000` instead of `t=1736707000`

### ✅ Booking Log Functionality
- **Bookings tab loads without 404 errors**
- **Booking data displays correctly**
- **Auto-refresh works (every 10 seconds)**
- **All booking actions work** (confirm, cancel, delete)

## If Still Not Working

If you're still seeing the old version after trying all methods:

1. **Check if you have a service worker** (F12 → Application → Service Workers)
2. **Disable any browser extensions** that might cache content
3. **Try a completely different device/browser**
4. **Contact support** with the exact console error messages

## Expected Results

Once the cache is cleared and the new version loads:
- ✅ **No more 404 errors** for `/api/admin/bookings`
- ✅ **Bookings load successfully** with proper data
- ✅ **All booking management features work**
- ✅ **Auto-refresh polling works correctly**

---

**Last Updated:** October 13, 2025  
**Version:** 5.7.0  
**Status:** Ready for testing
