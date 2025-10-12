# 📝 EVENT DATA UPDATE GUIDE

## 🎯 Purpose
This guide explains how to update the existing "after party" event with complete, proper data to fix the "undefined" values showing on the website.

---

## ⚠️ CURRENT ISSUES

The "after party" event is missing the following data:
- ❌ `min_age` → Shows "undefined+ years"
- ❌ `dress_code` → Shows "undefined"
- ❌ `available_tickets` → Shows "undefined tickets available"

---

## ✅ HOW TO FIX

### STEP 1: Open Admin Dashboard

1. Go to: https://afterstateevents.vercel.app/admin/
2. You should already be logged in
3. Click on the **"Events"** tab (should be active by default)

---

### STEP 2: Edit the Event

1. Find the "after party" event in the table
2. Click the **pencil icon** (✏️) in the Actions column
3. The edit form will appear

---

### STEP 3: Fill in Missing Fields

Complete the following fields in the edit form:

#### Required Fields to Update:

**Minimum Age:**
```
18
```
*(Or any appropriate age: 16, 18, 21, etc.)*

**Dress Code:**
```
Smart Casual
```
*(Or any appropriate dress code: Casual, Formal, Semi-Formal, Themed, etc.)*

**Available Tickets:**
```
100
```
*(Or the actual number of available tickets. Must be ≤ Total Tickets)*

**Total Tickets:**
```
100
```
*(If not already set, ensure this matches or is greater than Available Tickets)*

**Description:** *(If empty)*
```
Join us for an amazing after party event! Dance, socialize, and enjoy great music with fellow students. This is the perfect opportunity to unwind and celebrate together.
```

---

### STEP 4: Verify Other Important Fields

Make sure these are also filled:

**Event Title:** `after party` ✅ (already set)  
**Date:** `2025-10-12` ✅ (already set)  
**Time:** `21:54` ✅ (already set)  
**Location:** `no house` ✅ (already set, but consider updating to a real location)  
**Price:** `120.00` ✅ (already set)  
**Currency:** `EUR` ✅ (already set)  
**Status:** `Active` ✅ (already set)  

#### Optional: Update Location to Real Address
Consider changing "no house" to something like:
```
Campus Main Hall, Building A
```
or
```
Student Union, 123 University Ave
```

---

### STEP 5: Save Changes

1. Scroll to the bottom of the form
2. Click **"Save Event"** button
3. Wait for the success notification: "Event updated successfully!"

---

### STEP 6: Verify the Fix

#### A. Refresh Admin Dashboard
1. Press **F5** to refresh the page
2. Verify the event still shows in the table with all data

#### B. Check Homepage
1. Open a new tab: https://afterstateevents.vercel.app/
2. Find the "after party" event card
3. Verify it now shows:
   - "Min age: 18+" (instead of "undefined+")
   - "100 tickets available" (instead of "undefined tickets")

#### C. Check Event Details Page
1. Click on the "after party" event card
2. Verify the event details page shows:
   - "Minimum Age: 18+ years" (instead of "undefined+")
   - "Dress Code: Smart Casual" (instead of "undefined")
   - "100 tickets available" (instead of "undefined")

---

## 📊 EXAMPLE: COMPLETE EVENT DATA

Here's what a properly filled event looks like:

```yaml
Event Title: After Party Celebration
Date: 2025-10-12
Time: 21:54
Location: Campus Main Hall, Building A
Price: 120.00
Currency: EUR
Minimum Age: 18
Dress Code: Smart Casual
Total Tickets: 100
Available Tickets: 100
Status: Active
Description: |
  Join us for an amazing after party event! Dance, socialize, 
  and enjoy great music with fellow students. This is the 
  perfect opportunity to unwind and celebrate together.
  
  What to expect:
  - Live DJ
  - Refreshments provided
  - Photo booth
  - Networking opportunities
Additional Info: |
  - Doors open at 21:30
  - Event ends at 02:00
  - Valid student ID required for entry
```

---

## 🔍 TROUBLESHOOTING

### Issue 1: Changes Don't Save
**Solution:** Check browser console (F12) for errors and verify you have admin permissions.

### Issue 2: Changes Revert After Refresh
**Solution:** This was a bug that has been fixed. If it still happens:
1. Clear browser cache (Ctrl+Shift+Del)
2. Refresh the page
3. Try editing again

### Issue 3: Still Shows "undefined" After Update
**Solution:**
1. Clear browser cache
2. Hard refresh homepage (Ctrl+Shift+R)
3. Check if the API is returning the updated data:
   - Open browser console (F12)
   - Go to Network tab
   - Refresh page
   - Find the `/api/events` request
   - Check the response data

---

## 🎯 AFTER FIXING

Once you've updated the event data:

✅ Homepage will show proper age requirement  
✅ Event details will show all information correctly  
✅ No more "undefined" values anywhere  
✅ Professional appearance for users  

---

## 💡 BEST PRACTICES

When creating or editing events in the future:

1. **Always fill all required fields:**
   - Title, Date, Time, Location
   - Price, Currency
   - Min Age, Dress Code
   - Total Tickets, Available Tickets
   - Description

2. **Use clear, descriptive text:**
   - Location: Real address or building name
   - Description: What to expect, what's included
   - Dress Code: Clear guidelines (not just "undefined")

3. **Double-check after saving:**
   - Refresh admin page to verify persistence
   - Check frontend to see how users see it
   - Test the booking flow

4. **Keep data up-to-date:**
   - Update available tickets as bookings come in
   - Change status when event is full or completed
   - Update description if event details change

---

## 📞 NEED HELP?

If you encounter any issues:
1. Check the browser console for error messages (F12)
2. Verify Railway backend is running: https://studentevents-production.up.railway.app/api/health
3. Check the `MANUAL_TEST_RESULTS.md` for known issues

---

**Guide Created:** October 12, 2025  
**Last Updated:** October 12, 2025  
**Status:** ✅ All fixes deployed


