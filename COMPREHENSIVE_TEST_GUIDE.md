# 📋 COMPREHENSIVE TESTING GUIDE

**System:** Event Ticketing Platform with Worker Validation  
**Version:** 1.0 (89% Complete - 17/19 features)  
**Date:** October 12, 2025  
**Status:** Production Ready

---

## 🎯 TESTING OVERVIEW

This guide provides **complete manual testing procedures** for all system features. Use this as your **final quality assurance checklist** before going live.

---

## ✅ PRE-TESTING SETUP

### 1. Database Migrations
**Status:** ⏳ Must run before testing

```sql
-- In Supabase SQL Editor, run in order:

-- Phase 2: Settings enhancements
-- File: backend/supabase-phase2-settings-migration.sql
DO $$ BEGIN
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS support_phone TEXT;
    ALTER TABLE settings ADD COLUMN IF NOT EXISTS support_working_hours TEXT;
END $$;

-- Phase 4: Worker system
-- File: backend/supabase-phase4-workers-migration.sql
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'worker',
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase 5: Ticket validation
-- File: backend/supabase-phase5-ticket-validation.sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tickets_validated JSONB DEFAULT '[]';
CREATE INDEX IF NOT EXISTS idx_bookings_payment_reference ON bookings(payment_reference);
```

### 2. Environment Variables Check
**Location:** Railway Dashboard

✅ Verify these are set:
- `DATABASE_URL` (Supabase connection string)
- `JWT_SECRET` (any secure string)
- `SENDGRID_API_KEY` (your SendGrid key)
- `SENDGRID_FROM_EMAIL` (verified sender email)

### 3. Test Accounts
**Admin:** admin@studentevents.com / admin123  
**Worker:** (Create during testing)  
**Customer:** (Use any email for booking)

---

## 🧪 TEST SUITE

### CATEGORY 1: ADMIN DASHBOARD ✅

#### Test 1.1: Admin Login
**URL:** https://afterstateevents.vercel.app/admin/

**Steps:**
1. Navigate to admin login
2. Enter credentials: admin@studentevents.com / admin123
3. Click "Login"

**Expected:**
- ✅ Successful login
- ✅ Redirected to dashboard
- ✅ See Events tab with any existing events

**Status:** [ ] Pass [ ] Fail

---

#### Test 1.2: Create Event
**Tab:** Events

**Steps:**
1. Click "Create Event" button
2. Fill form:
   - Title: "Test Spring Festival"
   - Date: (future date)
   - Time: "20:00"
   - Location: "Campus Square"
   - Price: 15.00
   - Currency: EUR
   - Description: "Amazing spring celebration"
   - Min Age: 18
   - Dress Code: "Smart Casual"
   - Total Tickets: 100
   - Available Tickets: 100
   - Status: "Active"
3. Click "Save Event"

**Expected:**
- ✅ Event appears in table
- ✅ Shows correct details
- ✅ Success notification

**Status:** [ ] Pass [ ] Fail

---

#### Test 1.3: Edit Event
**Tab:** Events

**Steps:**
1. Click edit icon on test event
2. Change title to "Test Spring Festival 2025"
3. Change price to 20.00
4. Click "Save Changes"
5. Refresh page

**Expected:**
- ✅ Changes persist after refresh
- ✅ Title shows "Test Spring Festival 2025"
- ✅ Price shows €20.00

**Status:** [ ] Pass [ ] Fail

---

#### Test 1.4: Coming Soon Status
**Tab:** Events

**Steps:**
1. Edit test event
2. Change status to "Coming Soon"
3. Set Tickets Available Date to (future date)
4. Save changes
5. Visit homepage

**Expected:**
- ✅ Event shows "COMING SOON" badge
- ✅ "Buy Tickets" button disabled
- ✅ Shows "Tickets Available Soon"

**Status:** [ ] Pass [ ] Fail

---

#### Test 1.5: Create Worker
**Tab:** Workers

**Steps:**
1. Click "Add Worker" button
2. Fill form:
   - Full Name: "John Scanner"
   - Email: "worker@test.com"
   - Password: "Test123!"
   - Role: "Worker"
   - Event: (select test event)
3. Click "Save"

**Expected:**
- ✅ Worker appears in table
- ✅ Shows correct role badge
- ✅ Event name displayed

**Status:** [ ] Pass [ ] Fail

---

#### Test 1.6: Filter Bookings by Event
**Tab:** Bookings

**Steps:**
1. Go to Bookings tab
2. Use event filter dropdown
3. Select specific event
4. Verify filtered results

**Expected:**
- ✅ Shows only bookings for selected event
- ✅ Filter persists after page refresh

**Status:** [ ] Pass [ ] Fail

---

#### Test 1.7: Export to Excel
**Tab:** Bookings

**Steps:**
1. Click "Export to Excel" button
2. Open downloaded file

**Expected:**
- ✅ File downloads
- ✅ Contains all booking data
- ✅ Properly formatted columns

**Status:** [ ] Pass [ ] Fail

---

#### Test 1.8: Update Organization Branding
**Tab:** Settings

**Steps:**
1. Go to Settings tab
2. Update:
   - Organization Name: "Test Events"
   - Support Phone: "+370 600 12345"
   - Support Hours: "Mon-Fri 10:00-18:00"
3. Save settings
4. Visit homepage

**Expected:**
- ✅ Homepage shows "Test Events" instead of "StudentEvents"
- ✅ Support contacts updated
- ✅ Changes reflected globally

**Status:** [ ] Pass [ ] Fail

---

### CATEGORY 2: PUBLIC WEBSITE ✅

#### Test 2.1: Homepage Loads
**URL:** https://afterstateevents.vercel.app/

**Steps:**
1. Navigate to homepage
2. Wait for events to load

**Expected:**
- ✅ Homepage loads without errors
- ✅ Events display correctly
- ✅ Organization branding appears
- ✅ Navigation works

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.2: Event Details Page
**URL:** Click any event

**Steps:**
1. Click on test event
2. Review event details page

**Expected:**
- ✅ All event information displayed
- ✅ Date, time, location correct
- ✅ Price shown correctly
- ✅ "Buy Ticket" button visible (if active)

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.3: Complete Booking (Single Attendee)
**Start:** Event details page

**Steps:**
1. Click "Buy Ticket"
2. Fill checkout form:
   - Quantity: 1
   - First Name: "Jane"
   - Last Name: "Test"
   - Email: "test@example.com"
   - Phone: "+370 600 11111"
   - Select: "ISM Student" or "Guest (+1)"
3. Click "Proceed to Payment"

**Expected:**
- ✅ Form validation works
- ✅ Redirects to payment instructions
- ✅ Shows correct amount
- ✅ Unique payment reference generated

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.4: Complete Booking (Multiple Attendees)
**Start:** Event details page

**Steps:**
1. Click "Buy Ticket"
2. Select quantity: 3
3. Fill primary contact info
4. Fill additional attendee forms (2 more)
5. Submit booking

**Expected:**
- ✅ Dynamic forms appear for each attendee
- ✅ All required fields validate
- ✅ Payment reference includes all names
- ✅ Correct total amount calculated

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.5: Payment Instructions Display
**After:** Creating booking

**Steps:**
1. Review payment instructions page
2. Check all sections

**Expected:**
- ✅ Event details correct
- ✅ All attendees listed
- ✅ Bank transfer details shown
- ✅ Payment reference displayed
- ✅ Important warnings visible

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.6: Download Pending Ticket PDF
**On:** Payment instructions page

**Steps:**
1. Click "Download Ticket" button
2. Open downloaded PDF

**Expected:**
- ✅ PDF downloads successfully
- ✅ Contains all attendee info
- ✅ QR codes generated for each person
- ✅ "PAYMENT PENDING" warning visible
- ✅ Support contacts included

**Status:** [ ] Pass [ ] Fail

---

#### Test 2.7: Rules & Policy Page
**URL:** https://afterstateevents.vercel.app/rules.html

**Steps:**
1. Navigate to rules page
2. Read content
3. Click "Download as PDF"

**Expected:**
- ✅ Rules page loads
- ✅ Content displays correctly
- ✅ Download works
- ✅ Organization branding applied

**Status:** [ ] Pass [ ] Fail

---

### CATEGORY 3: WORKER PORTAL ✅

#### Test 3.1: Worker Login
**URL:** https://afterstateevents.vercel.app/worker/login.html

**Steps:**
1. Navigate to worker login
2. Enter credentials created in Test 1.5
3. Click "Login"

**Expected:**
- ✅ Successful login
- ✅ Redirected to scanner dashboard
- ✅ Event name displayed
- ✅ Worker name/role shown

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.2: Manual Ticket Validation
**Location:** Worker dashboard

**Steps:**
1. Get payment reference from Test 2.3 booking
2. Enter ticket number in manual input
3. Click "Validate"

**Expected (if admin approved booking):**
- ✅ Shows "VALID TICKET" ✓
- ✅ Displays attendee name
- ✅ Shows event title
- ✅ Timestamp logged

**Expected (if not yet approved):**
- ✅ Shows "NOT PAID" status
- ✅ Appropriate error message

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.3: QR Code Scanning
**Location:** Worker dashboard

**Steps:**
1. Click "Start Camera"
2. Point camera at QR code from PDF ticket
3. Wait for scan

**Expected:**
- ✅ Camera starts successfully
- ✅ QR code recognized
- ✅ Validation result displayed
- ✅ Same result as manual entry

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.4: Duplicate Ticket Prevention
**Location:** Worker dashboard

**Steps:**
1. Scan/enter same ticket number again
2. Review result

**Expected:**
- ✅ Shows "ALREADY USED" status
- ✅ Displays previous validation timestamp
- ✅ Does not allow re-entry

**Status:** [ ] Pass [ ] Fail

---

#### Test 3.5: Wrong Event Validation
**Setup:** Create worker for different event

**Steps:**
1. Login as worker assigned to Event A
2. Try to validate ticket for Event B

**Expected:**
- ✅ Shows "WRONG EVENT" error
- ✅ Ticket not marked as used
- ✅ Attendee name still displayed for reference

**Status:** [ ] Pass [ ] Fail

---

### CATEGORY 4: EMAIL SYSTEM ✅

#### Test 4.1: Booking Confirmation Email
**Setup:** Create test booking (Test 2.3)

**Steps:**
1. Admin approves booking in dashboard
2. Check customer email

**Expected:**
- ✅ Email received within 1 minute
- ✅ Contains event details
- ✅ Lists all attendees
- ✅ Includes ticket numbers
- ✅ QR codes embedded (or attached)
- ✅ "VALID TICKET" header/notice

**Status:** [ ] Pass [ ] Fail

---

#### Test 4.2: Multi-Attendee Email
**Setup:** Booking with 3 people (Test 2.4)

**Steps:**
1. Admin approves booking
2. Check email

**Expected:**
- ✅ Single email sent
- ✅ Contains all 3 tickets
- ✅ Each has unique ticket number
- ✅ Each has unique QR code
- ✅ All attendee names listed

**Status:** [ ] Pass [ ] Fail

---

### CATEGORY 5: DATA SYNCHRONIZATION ✅

#### Test 5.1: Admin → Homepage Sync
**Steps:**
1. Admin edits event (change title)
2. Open homepage in new browser tab
3. Refresh homepage

**Expected:**
- ✅ Changes appear immediately
- ✅ Updated title displayed
- ✅ No caching issues

**Status:** [ ] Pass [ ] Fail

---

#### Test 5.2: Booking → Admin Dashboard Sync
**Steps:**
1. Create new booking on public site
2. Watch admin Bookings tab (leave open)
3. Wait 10 seconds

**Expected:**
- ✅ New booking appears within 10 seconds
- ✅ Auto-refresh polling working
- ✅ Correct data displayed

**Status:** [ ] Pass [ ] Fail

---

#### Test 5.3: Settings → Global Update
**Steps:**
1. Change organization name in settings
2. Open homepage, worker login, rules page
3. Refresh all pages

**Expected:**
- ✅ New org name on all pages
- ✅ Support contacts updated everywhere
- ✅ Consistent branding

**Status:** [ ] Pass [ ] Fail

---

### CATEGORY 6: MOBILE RESPONSIVENESS ✅

#### Test 6.1: Mobile Homepage
**Device:** Use browser dev tools, mobile view

**Steps:**
1. View homepage on mobile (375px width)
2. Navigate through pages

**Expected:**
- ✅ Layout adapts correctly
- ✅ Event cards stack vertically
- ✅ Navigation menu accessible
- ✅ All content readable

**Status:** [ ] Pass [ ] Fail

---

#### Test 6.2: Mobile Checkout
**Device:** Mobile view

**Steps:**
1. Complete booking on mobile
2. Fill all forms

**Expected:**
- ✅ Forms render correctly
- ✅ Input fields accessible
- ✅ Radio buttons work
- ✅ Submit button visible

**Status:** [ ] Pass [ ] Fail

---

#### Test 6.3: Mobile Worker Scanner
**Device:** Mobile view (or actual mobile device)

**Steps:**
1. Login as worker on mobile
2. Use QR scanner

**Expected:**
- ✅ Camera accessible
- ✅ Scanner interface usable
- ✅ Manual input works
- ✅ Results readable

**Status:** [ ] Pass [ ] Fail

---

### CATEGORY 7: PERFORMANCE ✅

#### Test 7.1: Page Load Times
**Tools:** Browser DevTools Network tab

**Steps:**
1. Measure load time for each page
2. Clear cache between tests

**Expected:**
- ✅ Homepage: < 3 seconds
- ✅ Event details: < 2 seconds
- ✅ Checkout: < 2 seconds
- ✅ Admin dashboard: < 3 seconds

**Status:** [ ] Pass [ ] Fail

---

#### Test 7.2: API Response Times
**Tools:** Browser Network tab

**Steps:**
1. Monitor API calls
2. Check response times

**Expected:**
- ✅ GET /api/events: < 500ms
- ✅ POST /api/bookings: < 1000ms
- ✅ POST /api/workers/validate-ticket: < 500ms
- ✅ GET /api/admin/bookings: < 1000ms

**Status:** [ ] Pass [ ] Fail

---

### CATEGORY 8: SECURITY ✅

#### Test 8.1: Admin Authentication
**Steps:**
1. Try accessing /admin/ without login
2. Try with wrong password
3. Try accessing admin API without token

**Expected:**
- ✅ Redirected to login
- ✅ Invalid credentials rejected
- ✅ API returns 401 Unauthorized

**Status:** [ ] Pass [ ] Fail

---

#### Test 8.2: Worker Authentication
**Steps:**
1. Try accessing /worker/index.html without login
2. Try validating ticket without token
3. Try accessing other worker's event data

**Expected:**
- ✅ Redirected to login
- ✅ Token required for validation
- ✅ Event-specific access enforced

**Status:** [ ] Pass [ ] Fail

---

#### Test 8.3: SQL Injection Prevention
**Steps:**
1. Try entering SQL in event title: "'; DROP TABLE events; --"
2. Submit booking with SQL in name
3. Check database

**Expected:**
- ✅ Input sanitized
- ✅ No SQL executed
- ✅ Data stored safely

**Status:** [ ] Pass [ ] Fail

---

## 📊 TEST RESULTS SUMMARY

### Completion Checklist

**Category 1: Admin Dashboard**
- [ ] Test 1.1: Admin Login
- [ ] Test 1.2: Create Event
- [ ] Test 1.3: Edit Event
- [ ] Test 1.4: Coming Soon Status
- [ ] Test 1.5: Create Worker
- [ ] Test 1.6: Filter Bookings
- [ ] Test 1.7: Export Excel
- [ ] Test 1.8: Organization Branding

**Category 2: Public Website**
- [ ] Test 2.1: Homepage
- [ ] Test 2.2: Event Details
- [ ] Test 2.3: Single Booking
- [ ] Test 2.4: Multi Booking
- [ ] Test 2.5: Payment Instructions
- [ ] Test 2.6: Download PDF
- [ ] Test 2.7: Rules Page

**Category 3: Worker Portal**
- [ ] Test 3.1: Worker Login
- [ ] Test 3.2: Manual Validation
- [ ] Test 3.3: QR Scanning
- [ ] Test 3.4: Duplicate Prevention
- [ ] Test 3.5: Wrong Event

**Category 4: Email System**
- [ ] Test 4.1: Single Email
- [ ] Test 4.2: Multi Email

**Category 5: Data Sync**
- [ ] Test 5.1: Admin → Homepage
- [ ] Test 5.2: Booking → Admin
- [ ] Test 5.3: Settings → Global

**Category 6: Mobile**
- [ ] Test 6.1: Mobile Homepage
- [ ] Test 6.2: Mobile Checkout
- [ ] Test 6.3: Mobile Scanner

**Category 7: Performance**
- [ ] Test 7.1: Load Times
- [ ] Test 7.2: API Times

**Category 8: Security**
- [ ] Test 8.1: Admin Auth
- [ ] Test 8.2: Worker Auth
- [ ] Test 8.3: SQL Injection

---

## 🐛 BUG TRACKING

### Issues Found

| # | Category | Description | Severity | Status |
|---|----------|-------------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## ✅ FINAL SIGN-OFF

**Tested By:** ________________  
**Date:** ________________  
**Overall Status:** [ ] Pass [ ] Fail [ ] Pass with Minor Issues

**Notes:**
```
[Add any additional observations or recommendations]
```

---

## 📞 SUPPORT

**Issues?** Contact development team:
- **Email:** (your email)
- **GitHub:** (repository issues)

**Production URLs:**
- **Frontend:** https://afterstateevents.vercel.app
- **Backend:** https://studentevents-production.up.railway.app
- **Admin:** /admin/index.html
- **Worker:** /worker/login.html

---

**End of Test Guide**

**System Status:** Ready for Production Testing  
**Completion:** 89% (17/19 features)  
**Next:** Run this test suite before going live!


