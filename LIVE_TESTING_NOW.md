# 🧪 LIVE TESTING SESSION - START NOW

**System:** Event Ticketing Platform (100% Complete)  
**Testing Date:** October 12, 2025  
**Live URLs:** 
- Frontend: https://afterstateevents.vercel.app
- Admin: https://afterstateevents.vercel.app/admin/
- Worker: https://afterstateevents.vercel.app/worker/login.html

---

## 🚀 QUICK START (5 MINUTES)

### STEP 0: Run Migrations ⏳
**Status:** [ ] Done [ ] Skip (already done)

1. Open: https://supabase.com/dashboard/project/vaoyiepnrizvvqokhcuu
2. Click: SQL Editor
3. Copy & paste contents of `RUN_MIGRATIONS_NOW.sql`
4. Click: Run
5. Verify: Should see "✅ ALL MIGRATIONS COMPLETE!"

---

## 🎯 CRITICAL PATH TEST (10 MINUTES)

### TEST 1: Admin Login ✅
**URL:** https://afterstateevents.vercel.app/admin/

**Steps:**
1. Open URL in browser
2. Enter: admin@studentevents.com
3. Enter: admin123
4. Click: Login

**Expected Result:**
- ✅ Dashboard loads
- ✅ See Events tab
- ✅ See existing events (if any)

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 2: Create Test Event ✅
**Location:** Admin → Events tab

**Steps:**
1. Click "Create Event" button
2. Fill form:
   ```
   Title: TEST - Spring Festival 2025
   Date: 2025-05-15
   Time: 20:00
   Location: Campus Main Square
   Price: 20.00
   Currency: EUR
   Description: This is a test event for system verification
   Min Age: 18
   Dress Code: Smart Casual
   Total Tickets: 100
   Available Tickets: 100
   Status: Active
   ```
3. Click "Save Event"
4. **REFRESH PAGE** (F5)

**Expected Result:**
- ✅ Event appears in table
- ✅ Shows "TEST - Spring Festival 2025"
- ✅ Price shows €20.00
- ✅ **CRITICAL:** Event still there after refresh!

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 3: View Event on Homepage ✅
**URL:** https://afterstateevents.vercel.app/

**Steps:**
1. Open homepage in new tab
2. Look for your test event
3. Click on the event card

**Expected Result:**
- ✅ Test event visible on homepage
- ✅ All details correct
- ✅ "Buy Ticket" button visible
- ✅ Event details page loads

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 4: Complete Booking (2 People) ✅
**Location:** Event details page

**Steps:**
1. Click "Buy Ticket"
2. Select Quantity: 2
3. Fill Primary Contact:
   ```
   First Name: Test
   Last Name: User
   Email: YOUR_REAL_EMAIL@gmail.com  ← Use your real email!
   Phone: +370 600 12345
   Select: ISM Student
   ```
4. Fill Attendee 2:
   ```
   First Name: Guest
   Last Name: Person
   Email: YOUR_REAL_EMAIL@gmail.com
   Phone: +370 600 12346
   Select: Guest (+1)
   ```
5. Click "Proceed to Payment"

**Expected Result:**
- ✅ Form validates correctly
- ✅ Redirects to payment instructions
- ✅ Shows both attendees
- ✅ Shows bank transfer details
- ✅ Unique payment reference generated

**Status:** [ ] Pass [ ] Fail
**Payment Reference:** _______________
**Notes:** _______________

---

### TEST 5: Download Pending PDF ✅
**Location:** Payment instructions page

**Steps:**
1. Click "Download Ticket" button
2. Open downloaded PDF

**Expected Result:**
- ✅ PDF downloads successfully
- ✅ Contains event details
- ✅ Lists both attendees:
  - Test User (ISM Student)
  - Guest Person (Guest)
- ✅ Two unique ticket numbers
- ✅ Two unique QR codes
- ✅ **RED WARNING:** "PAYMENT PENDING - NOT VALID UNTIL PAID"
- ✅ Support contact info shown

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 6: Booking Appears in Admin ✅
**Location:** Admin → Bookings tab

**Steps:**
1. Go back to admin dashboard
2. Click "Bookings" tab
3. Wait 10 seconds (auto-refresh)
4. Look for your test booking

**Expected Result:**
- ✅ Booking appears in table
- ✅ Shows "Test User"
- ✅ Shows email
- ✅ Status: "Pending"
- ✅ Quantity: 2
- ✅ Event: TEST - Spring Festival 2025

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 7: Create Worker ✅
**Location:** Admin → Workers tab

**Steps:**
1. Click "Workers" tab
2. Click "Add Worker"
3. Fill form:
   ```
   Full Name: Test Worker
   Email: worker@test.com
   Password: Test123!
   Role: Worker
   Event: TEST - Spring Festival 2025
   ```
4. Click "Save"

**Expected Result:**
- ✅ Worker appears in table
- ✅ Shows "Test Worker"
- ✅ Role badge: "WORKER"
- ✅ Event: TEST - Spring Festival 2025

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 8: Worker Login ✅
**URL:** https://afterstateevents.vercel.app/worker/login.html

**Steps:**
1. Open worker login in new tab
2. Enter: worker@test.com
3. Enter: Test123!
4. Click "Access Scanner"

**Expected Result:**
- ✅ Login successful
- ✅ Redirects to scanner dashboard
- ✅ Shows worker name: "Test Worker"
- ✅ Shows event: "TEST - Spring Festival 2025"
- ✅ Camera/Scanner interface visible

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 9: Manual Ticket Validation (Should Fail - Not Paid) ✅
**Location:** Worker dashboard

**Steps:**
1. Get payment reference from Test 4
2. Enter ticket number in manual input
3. Click "Validate"

**Expected Result:**
- ✅ Shows validation result
- ⚠️ Status: "NOT PAID" or "Payment not confirmed"
- ✅ Shows attendee name
- ✅ Does NOT mark as validated

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 10: Approve Booking & Send Email ✅
**Location:** Admin → Bookings tab

**Steps:**
1. Find your test booking
2. Click the ✓ (checkmark/approve) button
3. Wait for confirmation
4. **CHECK YOUR EMAIL** (use the email from Test 4)

**Expected Result:**
- ✅ Booking status changes to "Paid"
- ✅ Success notification appears
- 📧 Email received within 1 minute:
  - ✅ Subject: Payment Confirmed
  - ✅ Contains event details
  - ✅ Lists both attendees
  - ✅ Shows ticket numbers
  - ✅ Includes QR codes (or mentions valid tickets)
  - ✅ Green "VALID TICKET" notice

**Status:** [ ] Pass [ ] Fail
**Email Received:** [ ] Yes [ ] No (check spam)
**Notes:** _______________

---

### TEST 11: Validate Paid Ticket ✅
**Location:** Worker dashboard

**Steps:**
1. Go back to worker dashboard
2. Enter same ticket number again
3. Click "Validate"

**Expected Result:**
- ✅ Status: "VALID TICKET" ✓
- ✅ Shows attendee name
- ✅ Shows event title
- ✅ Timestamp displayed
- ✅ Ticket marked as validated in database

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 12: Duplicate Prevention ✅
**Location:** Worker dashboard

**Steps:**
1. Enter SAME ticket number AGAIN
2. Click "Validate"

**Expected Result:**
- ⚠️ Status: "ALREADY USED" or "Ticket already validated"
- ✅ Shows previous validation timestamp
- ✅ Does NOT allow re-entry

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 13: Organization Branding ✅
**Location:** Admin → Settings tab

**Steps:**
1. Go to Settings tab
2. Update Bank Transfer Settings:
   ```
   Bank Recipient Name: Test Organization
   Bank IBAN: LT12 3456 7890 1234 5678
   Support Email: support@test.com
   Support Phone: +370 600 99999
   Support Hours: Mon-Fri 10:00-18:00
   ```
3. Click "Save Bank Settings"
4. Open homepage in new tab
5. Check footer and contact info

**Expected Result:**
- ✅ Settings save successfully
- ✅ Support phone shows on homepage
- ✅ Support hours visible
- ✅ Branding applied (if org name changed)

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 14: Excel Export ✅
**Location:** Admin → Bookings tab

**Steps:**
1. Go to Bookings tab
2. Click "Export to Excel" button
3. Open downloaded file

**Expected Result:**
- ✅ Excel file downloads
- ✅ Contains your test booking
- ✅ All columns present:
  - Booking ID
  - Event
  - Name
  - Email
  - Phone
  - Status
  - Amount
  - Date
- ✅ Data is correct

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 15: Rules & Policy Page ✅
**URL:** https://afterstateevents.vercel.app/rules.html

**Steps:**
1. Open rules page
2. Read content
3. Click "Download as PDF"

**Expected Result:**
- ✅ Page loads successfully
- ✅ Shows default rules content
- ✅ Download button works
- ✅ Text file downloads with rules
- ✅ Support contacts visible

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 16: Mobile Responsiveness ✅
**Device:** Browser Developer Tools (F12)

**Steps:**
1. Open homepage
2. Press F12
3. Click device toolbar icon (mobile view)
4. Select iPhone or Android
5. Navigate through site

**Expected Result:**
- ✅ Homepage adapts to mobile
- ✅ Event cards stack vertically
- ✅ Navigation menu works
- ✅ Checkout form usable
- ✅ All text readable

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 17: Coming Soon Status ✅
**Location:** Admin → Events

**Steps:**
1. Edit your test event
2. Change Status to: "Coming Soon"
3. Set Tickets Available Date: (future date)
4. Save
5. Refresh homepage

**Expected Result:**
- ✅ Event shows "COMING SOON" badge
- ✅ "Buy Tickets" button disabled
- ✅ Shows "Tickets Available Soon"

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 18: Delete Booking ✅
**Location:** Admin → Bookings

**Steps:**
1. Create another test booking (quick one)
2. In admin, click delete icon (trash)
3. Confirm deletion
4. Verify it's gone

**Expected Result:**
- ✅ Confirm dialog appears
- ✅ Booking is deleted
- ✅ Disappears from table
- ✅ Permanently removed from database

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 19: Event Filter for Bookings ✅
**Location:** Admin → Bookings

**Steps:**
1. Create bookings for different events (if possible)
2. Use event filter dropdown
3. Select specific event
4. Refresh page

**Expected Result:**
- ✅ Filter dropdown works
- ✅ Shows only selected event's bookings
- ✅ Filter persists after refresh
- ✅ "All Events" option shows everything

**Status:** [ ] Pass [ ] Fail
**Notes:** _______________

---

### TEST 20: Performance Check ✅
**Tool:** Browser Network tab (F12)

**Steps:**
1. Clear browser cache (Ctrl+Shift+Del)
2. Open homepage
3. Check Network tab load time

**Expected Result:**
- ✅ Homepage loads in < 3 seconds
- ✅ Event details < 2 seconds
- ✅ Admin dashboard < 3 seconds
- ✅ No 500 errors
- ✅ No failed API calls

**Status:** [ ] Pass [ ] Fail
**Load Time:** _____ seconds
**Notes:** _______________

---

## 📊 TEST RESULTS SUMMARY

### Critical Tests (MUST PASS):
- [ ] Admin Login (Test 1)
- [ ] Create Event (Test 2)
- [ ] Event on Homepage (Test 3)
- [ ] Complete Booking (Test 4)
- [ ] Worker System (Tests 7-12)
- [ ] Email Delivery (Test 10)

### Important Tests (SHOULD PASS):
- [ ] PDF Generation (Test 5)
- [ ] Excel Export (Test 14)
- [ ] Organization Branding (Test 13)
- [ ] Mobile Responsive (Test 16)

### Enhancement Tests (NICE TO PASS):
- [ ] Rules Page (Test 15)
- [ ] Coming Soon (Test 17)
- [ ] Performance (Test 20)

### Overall Status:
**Total Tests:** 20  
**Passed:** _____  
**Failed:** _____  
**Pass Rate:** _____%

---

## 🐛 ISSUES FOUND

| # | Test | Issue Description | Severity | Status |
|---|------|-------------------|----------|--------|
| 1 |      |                   |          |        |
| 2 |      |                   |          |        |
| 3 |      |                   |          |        |

**Severity Levels:**
- 🔴 Critical (blocks production)
- 🟡 Major (affects functionality)
- 🟢 Minor (cosmetic/enhancement)

---

## ✅ PRODUCTION READINESS

**System is ready for production if:**
- ✅ At least 16/20 tests pass (80%)
- ✅ All Critical Tests pass
- ✅ No Critical bugs found
- ✅ Email delivery works
- ✅ Worker validation works

**Current Status:** [ ] Ready [ ] Not Ready [ ] Ready with Minor Issues

**Recommended Action:**
- [ ] Deploy to production now
- [ ] Fix issues first
- [ ] Retest failed areas

---

## 📝 TESTING NOTES

**Date:** ______________  
**Tester:** ______________  
**Duration:** ______ minutes  

**General Observations:**
```
[Add any notes about the testing experience]
```

**Performance Notes:**
```
[Add notes about speed, responsiveness]
```

**User Experience Notes:**
```
[Add notes about usability, design]
```

---

## 🎯 NEXT STEPS

After testing:

1. **If all tests pass:**
   - ✅ System is production-ready!
   - ✅ Start creating real events
   - ✅ Begin marketing/promotion

2. **If minor issues found:**
   - 📝 Document issues
   - 🔧 Create fix list
   - ✅ Deploy after fixes

3. **If major issues found:**
   - 🚨 Review COMPREHENSIVE_TEST_GUIDE.md
   - 🐛 Debug specific failures
   - 🔄 Rerun failed tests

---

## 📞 SUPPORT

**Need Help?**
- Check: `COMPREHENSIVE_TEST_GUIDE.md` (detailed guide)
- Check: `100_PERCENT_COMPLETE.md` (system overview)
- Review: Railway logs (backend errors)
- Review: Vercel logs (frontend errors)
- Check: Supabase logs (database issues)

---

**START TESTING NOW!** 🚀

**Go to Test 1 and work through each test systematically.**


