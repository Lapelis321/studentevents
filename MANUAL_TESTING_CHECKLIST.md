# Manual Testing Checklist - StudentEvents

## 🚨 CRITICAL ISSUE IDENTIFIED

**Railway is NOT deploying latest code!**
- Current Railway deployment: Commit `14f8319a` (old)
- Latest code in GitHub: Commit `50025ab` (new with CORS fix)
- **Action Required:** Force Railway to deploy latest commit

---

## PRE-TESTING: Deploy Latest Code

### Step 1: Verify Railway Deployment

1. **Go to Railway Dashboard:**
   - URL: https://railway.app
   - Open your `afterstate.events` → `production` service

2. **Check Current Deployment:**
   - Click "Deployments" tab
   - Look for commit hash: Should be `50025ab` or `3480cb3` or newer
   - If it's still `14f8319a` → Railway hasn't deployed!

3. **Force Redeploy:**
   - Click "Settings" tab
   - **CRITICAL:** Clear these fields (leave empty):
     - ✅ Pre-deploy Command (currently `npm run migrate`)
     - ✅ Custom Start Command (currently `npm run start`)
   - Click "Save"
   - Go to "Deployments" → Click "Redeploy"

4. **Monitor Build Logs:**
   Look for:
   ```
   ✅ cd backend-new && npm ci --omit=dev
   ✅ Installing 198 packages
   ✅ cd backend-new && node server.js
   ✅ StudentEvents API Server v2.0.0
   ✅ Database connected successfully
   ```

5. **Wait 5-7 Minutes** for deployment to complete

---

## TEST PHASE 1: Verify Deployment (5 minutes)

### Test 1.1: Health Check
**URL:** `https://studentevents-production.up.railway.app/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "backend_version": "NEW-BACKEND-2.0.0",
  "database": "connected",
  "timestamp": "2024-10-23..."
}
```

**❌ If you get:** "Cannot GET /health" → Old backend still running
**✅ Pass:** backend_version shows "NEW-BACKEND-2.0.0"

---

### Test 1.2: Version Check
**URL:** `https://studentevents-production.up.railway.app/api/version`

**Expected Response:**
```json
{
  "version": "2.0.0",
  "backend": "NEW-BACKEND",
  "timestamp": "2024-10-23..."
}
```

**❌ If you get:** `{"error": "Route not found"}` → Old backend still running!
**✅ Pass:** Shows "backend": "NEW-BACKEND"

---

### Test 1.3: CORS Check
**Open:** `https://afterstateevents.vercel.app`
**Open Console:** Press F12

**Look for:**
- ❌ BAD: "blocked by CORS policy" error
- ✅ GOOD: No CORS errors, events load

**If CORS errors persist:**
1. Check Railway logs for: `⚠️ CORS rejected origin: https://afterstateevents.vercel.app`
2. If you see this, Railway deployed old code

---

## TEST PHASE 2: Authentication (10 minutes)

### Test 2.1: Admin Login
**URL:** `https://afterstateevents.vercel.app/admin/login.html`

**Credentials:**
- Email: `admin@studentevents.com`
- Password: `admin123`

**Test:**
1. Enter credentials
2. Click "Login"
3. **Expected:** Redirect to `/admin/dashboard.html`
4. **Expected:** See "Dashboard" heading
5. **Expected:** See 4 tabs: Events, Bookings, Workers, Settings

**❌ Fails if:**
- "Invalid credentials" → Check Supabase `admin` table
- CORS error → Backend not updated
- Network error → Check Railway is running

**✅ Pass:** Dashboard loads with navigation tabs

---

### Test 2.2: Worker Login
**URL:** `https://afterstateevents.vercel.app/worker/login.html`

**Test Credentials:**
- Email: `john.worker@studentevents.com`
- Password: `worker123`

**Test:**
1. Enter credentials
2. Click "Login"
3. **Expected:** Redirect to `/worker/dashboard.html`
4. **Expected:** See "Worker Dashboard" heading

**✅ Pass:** Worker dashboard loads

---

### Test 2.3: Logout
**From:** Admin or Worker dashboard

**Test:**
1. Click "Logout" button (top right)
2. **Expected:** Redirect to homepage
3. **Expected:** Cannot access dashboard without login

**✅ Pass:** Logout works, dashboard protected

---

## TEST PHASE 3: Events Management (20 minutes)

### Test 3.1: View Events (Admin)
**URL:** `https://afterstateevents.vercel.app/admin/dashboard.html`

**Test:**
1. Login as admin
2. Click "Events" tab (should be default)
3. **Expected:** See event table (or "No events" if empty)
4. **Expected:** See stats: Total Events, Active Events, Total Tickets Sold

**Check Console:**
- Should NOT see CORS errors
- Should see: API requests succeed

**✅ Pass:** Events tab shows table/empty state

---

### Test 3.2: Create Event
**From:** Admin Dashboard → Events tab

**Test:**
1. Click "Create Event" button
2. **Modal should open** with form
3. **CRITICAL:** Check modal displays correctly:
   - ✅ Header visible at top
   - ✅ Form scrollable in middle
   - ✅ Footer with buttons visible at bottom
   - ✅ "Cancel" and "Create Event" buttons visible

**Fill Form:**
- Event Name: `Test Event Manual Check`
- Date & Time: Pick tomorrow at 20:00
- Location: `Test Venue, City`
- Description: `This is a manual test event`
- Price: `15.00`
- Total Tickets: `50`
- Minimum Age: `18`
- Dress Code: `Smart Casual`
- Status: `Active`

**Click "Create Event"**

**Expected:**
- ✅ Success notification: "Event created successfully"
- ✅ Modal closes
- ✅ Event appears in table
- ✅ Stats update (Total Events +1)

**❌ Fails if:**
- "Title, date, and location are required" → OLD BACKEND STILL RUNNING!
- "Missing required fields" with field details → New backend, but validation issue
- CORS error → Backend not updated

**✅ Pass:** Event created and visible in table

---

### Test 3.3: Edit Event
**From:** Admin Dashboard → Events tab

**Test:**
1. Find test event created above
2. Click "Edit" button
3. Modal opens with pre-filled data
4. Change Event Name to: `Test Event Manual Check (EDITED)`
5. Change Price to: `20.00`
6. Click "Save Event"

**Expected:**
- ✅ Success notification
- ✅ Changes reflected in table
- ✅ Price shows `€20.00`

**✅ Pass:** Event updated successfully

---

### Test 3.4: View Event on Homepage
**URL:** `https://afterstateevents.vercel.app`

**Test:**
1. Open homepage
2. **Expected:** See "Test Event Manual Check (EDITED)"
3. **Expected:** Shows correct details (price €20.00, date, location)
4. Click on event card

**Expected:**
- Opens event details page
- Shows full description
- Shows "Buy Tickets" button

**✅ Pass:** Event visible on homepage

---

### Test 3.5: Delete Event
**From:** Admin Dashboard → Events tab

**Test:**
1. Find test event
2. Click "Delete" button
3. **Expected:** Confirmation dialog
4. Click "Confirm"

**Expected:**
- ✅ Event removed from table
- ✅ Stats update (Total Events -1)
- ✅ Event no longer on homepage

**✅ Pass:** Event deleted successfully

---

## TEST PHASE 4: Bookings (30 minutes)

### Test 4.1: Create Real Booking (Public)
**URL:** `https://afterstateevents.vercel.app`

**Prerequisites:**
- Create a test event first (use Test 3.2)
- Event should be Active status

**Test:**
1. From homepage, click on test event
2. Click "Buy Tickets" button
3. **Booking Form Opens**

**Fill Form:**
- Number of Tickets: `2`
- First Name: `John`
- Last Name: `Tester`
- Email: `test@example.com`
- Phone: `+370-600-12345`

**Additional Attendee 2:**
- First Name: `Jane`
- Last Name: `Tester`

**Payment Method:**
- Select: `Manual Bank Transfer`
- Check "I agree to terms" checkbox
- Click "Continue"

**Expected:**
- ✅ Redirect to payment instructions page
- ✅ Shows bank details
- ✅ Shows reference code
- ✅ Shows "PENDING PAYMENT" message
- ✅ "Download Ticket" button available

**Click "Download Ticket"**

**Expected:**
- ✅ PDF downloads
- ✅ PDF shows "PENDING PAYMENT - NOT VALID" watermark
- ✅ PDF shows both attendees (John and Jane)
- ✅ PDF has QR code

**✅ Pass:** Booking created with pending status

---

### Test 4.2: View Booking (Admin)
**From:** Admin Dashboard → Bookings tab

**Test:**
1. Login as admin
2. Click "Bookings" tab
3. **Expected:** See booking created above
4. Find booking for `John Tester`

**Check Details:**
- ✅ Shows correct name
- ✅ Shows correct email
- ✅ Shows quantity: 2
- ✅ Shows amount: €40.00 (2 × €20)
- ✅ Status: "Pending"

**Click "View Details"**

**Expected:**
- ✅ Modal opens
- ✅ Shows all booking details
- ✅ Shows additional attendees
- ✅ "Download Ticket" button visible
- ✅ "Confirm Payment" button visible (if admin)

**✅ Pass:** Booking visible and details correct

---

### Test 4.3: Confirm Payment
**From:** Admin Dashboard → Bookings → View Details

**Test:**
1. Open booking details modal
2. Click "Confirm Payment" button
3. **Expected:** Confirmation dialog
4. Click "Confirm"

**Expected:**
- ✅ Status changes to "Paid"
- ✅ Success notification
- ✅ Booking updated in table

**Note:** In production, this should trigger email with valid ticket

**✅ Pass:** Payment confirmed successfully

---

### Test 4.4: Search Bookings
**From:** Admin Dashboard → Bookings tab

**Test:**
1. In search box, type: `John`
2. **Expected:** Filters to show only John's booking

3. Clear search, type: `test@example.com`
4. **Expected:** Shows booking by email

5. Clear search, type ticket number (from booking)
6. **Expected:** Shows specific booking

**✅ Pass:** Search works for name, email, ticket number

---

### Test 4.5: Download Ticket (After Payment)
**From:** Admin Dashboard → Bookings → View Details

**Test:**
1. Find confirmed booking (status: Paid)
2. Click "Download Ticket"

**Expected:**
- ✅ PDF downloads
- ✅ **NO** "PENDING PAYMENT" watermark
- ✅ Shows "VALID FOR ENTRY"
- ✅ Has QR code
- ✅ Shows all attendees

**✅ Pass:** Valid ticket generated

---

### Test 4.6: Manual Participant Addition
**From:** Admin Dashboard → Bookings tab

**Test:**
1. Click "Add Participant" button
2. **Expected:** Form opens

**Fill Form:**
- Event: Select test event
- First Name: `Manual`
- Last Name: `Participant`
- Email: `manual@test.com`
- Phone: `+370-600-99999`
- Quantity: `1`

3. Click "Add"

**Expected:**
- ✅ Booking created with status "Paid" (manual bookings auto-confirmed)
- ✅ Appears in bookings table
- ✅ Ticket can be downloaded

**✅ Pass:** Manual participant added

---

## TEST PHASE 5: Workers Management (15 minutes)

### Test 5.1: Create Worker
**From:** Admin Dashboard → Workers tab

**Test:**
1. Click "Add Worker" button
2. **Expected:** Form opens

**Fill Form:**
- Full Name: `Test Worker`
- Email: `testworker@test.com`
- Password: `test123`
- Role: `Worker`
- Assigned Event: Select test event

3. Click "Add"

**Expected:**
- ✅ Worker created
- ✅ Appears in workers table
- ✅ Can login with credentials

**✅ Pass:** Worker created successfully

---

### Test 5.2: Login as Worker
**URL:** `https://afterstateevents.vercel.app/worker/login.html`

**Test:**
1. Enter credentials: `testworker@test.com` / `test123`
2. Click "Login"

**Expected:**
- ✅ Redirect to worker dashboard (NOT supervisor)
- ✅ Shows assigned event
- ✅ Can search tickets

**✅ Pass:** Worker login works

---

### Test 5.3: Verify Ticket (Worker)
**From:** Worker Dashboard

**Test:**
1. Enter ticket number (from confirmed booking above)
2. Click "Search" or "Scan"

**Expected:**
- ✅ Shows ticket details
- ✅ Status: "Valid" (if paid) or "Pending Payment" (if pending)
- ✅ Shows participant name
- ✅ Shows event name

**Test Invalid Ticket:**
1. Enter: `INVALID123`
2. **Expected:** "Ticket not found" or "Invalid"

**✅ Pass:** Ticket verification works

---

### Test 5.4: Create Supervisor
**From:** Admin Dashboard → Workers tab

**Test:**
1. Create another worker with Role: `Supervisor`
2. Login as supervisor

**Expected:**
- ✅ Has all worker features
- ✅ **PLUS** can see full participant list
- ✅ **PLUS** can confirm payments

**✅ Pass:** Supervisor has additional permissions

---

## TEST PHASE 6: Settings & System (15 minutes)

### Test 6.1: View Settings
**From:** Admin Dashboard → Settings tab

**Test:**
1. Click "Settings" tab
2. **Expected:** See 4 sections:
   - Payment Settings
   - Contact Information
   - Organization Details
   - Policies & Rules

**✅ Pass:** All settings sections visible

---

### Test 6.2: Update Contact Information
**From:** Admin Dashboard → Settings → Contact

**Test:**
1. Change Support Email to: `test-support@example.com`
2. Click "Save"

**Expected:**
- ✅ Success notification
- ✅ Settings saved
- ✅ Reload page → changes persisted

**✅ Pass:** Settings update works

---

### Test 6.3: Edit Policy
**From:** Admin Dashboard → Settings → Policies

**Test:**
1. Find "Terms of Service" policy
2. Edit content
3. Click "Save All Policies"

**Expected:**
- ✅ Success notification
- ✅ Changes saved

**Verify:**
1. Open homepage
2. Click "Rules & Policy"
3. **Expected:** Shows updated policy content

**✅ Pass:** Policy editing works

---

### Test 6.4: Download Policy PDF
**From:** Rules & Policy page

**Test:**
1. Click "Download as PDF" button

**Expected:**
- ✅ PDF downloads
- ✅ Contains policy content
- ✅ Properly formatted

**✅ Pass:** PDF download works

---

### Test 6.5: Export Data
**From:** Admin Dashboard

**Test:**
1. **Events tab:** Click "Export All" button
   - **Expected:** JSON file downloads with all events

2. **Bookings tab:** Click "Export Participants"
   - **Expected:** CSV file downloads with bookings

3. **Workers tab:** Click "Export All Workers"
   - **Expected:** CSV file downloads with workers

**✅ Pass:** All exports work

---

### Test 6.6: System Backup
**From:** Admin Dashboard → Settings

**Test:**
1. Scroll to Data Management section
2. Click "Download Backup"

**Expected:**
- ✅ JSON file downloads
- ✅ Contains all system data (events, bookings, workers, settings)

**✅ Pass:** Backup works

---

## TEST PHASE 7: Auto-Refresh (5 minutes)

### Test 7.1: Auto-Refresh Dashboard
**From:** Admin Dashboard → Events tab

**Test:**
1. Open dashboard in one browser tab
2. Open admin dashboard in another browser tab (incognito)
3. In incognito, create a new event
4. In first tab, wait 30 seconds

**Expected:**
- ✅ Events list refreshes automatically
- ✅ New event appears without manual refresh
- ✅ Console shows: "🔄 Auto-refreshing data..."

**✅ Pass:** Auto-refresh works

---

## TEST PHASE 8: Edge Cases & Errors (20 minutes)

### Test 8.1: Invalid Login
**Test:**
1. Try login with wrong password
2. **Expected:** "Invalid credentials" error

3. Try login with non-existent email
4. **Expected:** "Invalid credentials" error

**✅ Pass:** Invalid credentials handled

---

### Test 8.2: Missing Required Fields
**Test:**
1. Try to create event without name
2. **Expected:** Validation error

3. Try to create booking without agreeing to terms
4. **Expected:** Validation error

**✅ Pass:** Validation works

---

### Test 8.3: Delete Event with Bookings
**Test:**
1. Create event
2. Create booking for event
3. Try to delete event

**Expected:**
- ✅ Confirmation: "This will delete all bookings"
- ✅ After confirm, event AND bookings deleted

**✅ Pass:** Cascade delete works

---

### Test 8.4: Duplicate Email
**Test:**
1. Try to create worker with existing email
2. **Expected:** Error: "Email already exists"

**✅ Pass:** Unique constraint enforced

---

### Test 8.5: Expired Token
**Test:**
1. Login to admin dashboard
2. Wait 7+ days (or manually expire token in code)
3. Try to create event

**Expected:**
- ✅ "Token expired" error
- ✅ Redirected to login

**✅ Pass:** Token expiration works

---

## TEST PHASE 9: Performance (10 minutes)

### Test 9.1: Page Load Speed
**Test:**
1. Open homepage (F12 → Network tab)
2. Check load time
3. **Expected:** < 3 seconds

**✅ Pass:** Fast page load

---

### Test 9.2: API Response Time
**Test:**
1. Open admin dashboard (F12 → Network tab)
2. Check API response times
3. **Expected:** Most requests < 500ms

**✅ Pass:** Fast API responses

---

### Test 9.3: Large Data Handling
**Test:**
1. Create 10+ events
2. Create 20+ bookings
3. Navigate dashboard

**Expected:**
- ✅ No lag or slowness
- ✅ Tables render quickly
- ✅ Search still fast

**✅ Pass:** Handles large datasets

---

## TEST PHASE 10: Mobile & Browser (15 minutes)

### Test 10.1: Mobile Responsiveness
**Test:**
1. Open homepage on mobile (or use DevTools device emulation)
2. Test on iPhone (375×667) and iPad (768×1024)

**Check:**
- ✅ Navigation works
- ✅ Forms usable
- ✅ Modals display correctly
- ✅ Buttons accessible

**✅ Pass:** Mobile friendly

---

### Test 10.2: Browser Compatibility
**Test on:**
1. Chrome (latest)
2. Firefox (latest)
3. Safari (latest)
4. Edge (latest)

**Expected:**
- ✅ All features work
- ✅ No console errors
- ✅ UI renders correctly

**✅ Pass:** Cross-browser compatible

---

## 🐛 BUG TRACKING

As you test, record any bugs you find:

### Bug Report Template:

**Bug ID:** #001
**Severity:** Critical / High / Medium / Low
**Title:** Short description

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected:** What should happen
**Actual:** What actually happened
**Console Errors:** Any errors
**Screenshot:** If applicable
**Browser:** Chrome 118
**URL:** Where it occurred

---

## ✅ TEST COMPLETION CHECKLIST

After completing all tests:

- [ ] Deployment verified (latest commit running)
- [ ] CORS working (no blocked requests)
- [ ] Admin login works
- [ ] Worker login works
- [ ] Events CRUD works (Create, Read, Update, Delete)
- [ ] Bookings creation works (both payment methods)
- [ ] Ticket verification works
- [ ] Payment confirmation works
- [ ] Manual participant addition works
- [ ] Workers management works
- [ ] Settings updates work
- [ ] Policy editing works
- [ ] PDF generation works (tickets, policies)
- [ ] Data exports work
- [ ] Auto-refresh works
- [ ] No critical bugs found
- [ ] Mobile responsive
- [ ] Cross-browser compatible

**Test Status:** ☐ PASS  ☐ FAIL
**Tested by:** ___________
**Date:** ___________
**Notes:** ___________

---

## 🚨 IF TESTS FAIL

### If CORS Still Blocks Requests:
- Railway hasn't deployed latest code
- Check Railway commit hash
- Force redeploy
- Wait 5-7 minutes

### If "Title, date, and location required" Error:
- OLD BACKEND STILL RUNNING!
- Railway must deploy commit `3480cb3` or newer
- Check Railway Settings (clear custom commands)
- Force redeploy

### If Nothing Works:
**Switch to Render.com:**
1. Follow `RENDER_DEPLOY_STEPS.txt`
2. Deploy to Render (15 minutes)
3. Update frontend config with Render URL
4. Everything will work immediately

---

## 📊 CURRENT KNOWN ISSUES

1. **Railway Not Auto-Deploying** (CRITICAL)
   - Status: Requires manual intervention
   - Fix: Clear custom deploy commands, redeploy
   - Alternative: Switch to Render.com

2. **Logo Size Issues** (FIXED in code)
   - Status: Fixed in commit `3480cb3`
   - Needs: Railway to deploy fix

3. **CORS Blocking** (FIXED in code)
   - Status: Fixed in commit `3a47d76`
   - Needs: Railway to deploy fix

4. **Supabase RLS Warnings** (INFO)
   - Status: Non-critical (backend handles security)
   - Fix: Optional - can be ignored for now

---

**START TESTING NOW:** Begin with Test Phase 1 (Verify Deployment) 🚀

