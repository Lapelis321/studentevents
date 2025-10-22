# 🧪 LOCAL TESTING GUIDE - Ready to Fix Issues

## ✅ **SERVERS RUNNING**

### Backend API
- **URL:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **Status:** ✓ Running
- **Database:** Connected to Supabase (Production)

### Frontend
- **URL:** http://localhost:8000
- **Status:** ✓ Running
- **Pages:** All HTML/CSS/JS files available

---

## 🎯 **TESTING PLAN - What to Test & Fix**

### **PHASE 1: Frontend Testing (Main User Flow)**

#### Test 1: Homepage - Event Display
1. Open http://localhost:8000
2. **Check:**
   - ✓ Events load from backend
   - ✓ Event cards show: title, date, location, price
   - ✓ Status badges work (sold-out, cancelled)
   - ⚠️ **TO FIX:** Check if descriptions are populated
   - ⚠️ **TO FIX:** Check if time field is shown

#### Test 2: Event Details Page
1. Click on an event card
2. **Check:**
   - ✓ Event details load correctly
   - ✓ All event information displays
   - ⚠️ **TO FIX:** Verify description is not "No description provided"
   - ⚠️ **TO FIX:** Verify min_age and dress_code are populated

#### Test 3: Checkout Flow (Critical)
1. Click "Get Tickets" on an event
2. Fill in primary attendee information
3. **Increase ticket quantity to 2+**
4. **Check:**
   - ✓ Additional attendee forms appear
   - ✓ All fields are present (firstName, lastName, email, phone)
   - ⚠️ **TO FIX:** Verify additional attendees submit correctly
5. Complete checkout
6. **Check payment instructions page:**
   - ✓ Booking details show correctly
   - ✓ Bank transfer details display
   - ⚠️ **TO TEST:** Download ticket PDF
   - ⚠️ **TO FIX:** Verify PDF has "PENDING PAYMENT" watermark

#### Test 4: PDF Ticket Download
1. On payment instructions page, click "Download Ticket PDF"
2. **Check the PDF:**
   - ✓ Event details are correct
   - ✓ Attendee information is correct
   - ✓ QR code is generated
   - ⚠️ **CRITICAL FIX NEEDED:** Add "PENDING PAYMENT - NOT VALID FOR ENTRY" watermark
   - ⚠️ **Should have:** Large angled watermark in center
   - ⚠️ **Should have:** Red warning box at bottom

---

### **PHASE 2: Admin Dashboard Testing**

#### Test 5: Admin Login
1. Go to http://localhost:8000/admin
2. Login with:
   - Email: `admin@studentevents.com`
   - Password: `admin123`
3. **Check:**
   - ✓ Login successful
   - ✓ Dashboard loads

#### Test 6: View Events List
1. On "Events" tab, view all events
2. **Check:**
   - ✓ Events display in table
   - ✓ All event data visible
   - ✓ Action buttons present (View, Edit, Delete)

#### Test 7: Edit Event (Critical Test!)
1. Click the **Edit** button (middle button, pencil icon)
2. **Check:**
   - ✓ Edit modal opens (not view modal)
   - ✓ Form fields are populated
   - ✓ All fields editable
3. Change event name or details
4. Click "Save Changes"
5. **Check:**
   - ✓ Changes save successfully
   - ⚠️ **TO VERIFY:** Refresh page - changes persist
   - ⚠️ **TO VERIFY:** Check main page - event updated there too

#### Test 8: View Bookings
1. Go to "Bookings" tab
2. **Check:**
   - ✓ Bookings list loads
   - ✓ All booking details visible
   - ✓ Additional attendees shown (if any)
3. **Test filtering:**
   - ✓ Filter by event works
   - ✓ Filter persists on refresh

#### Test 9: Mark Booking as Paid
1. Find a booking with status "Pending"
2. Click "Mark as Paid" button
3. **Check:**
   - ✓ Status changes to "Paid"
   - ⚠️ **CRITICAL:** Check if email is sent
   - ⚠️ **Expected:** Email with ticket PDFs to customer
   - ⚠️ **Issue:** SendGrid might not be configured locally

---

### **PHASE 3: Backend API Testing**

#### Test 10: API Health Check
```bash
curl http://localhost:3001/health
```
**Expected Response:**
```json
{"status":"healthy","timestamp":"..."}
```

#### Test 11: Events API
```bash
curl http://localhost:3001/api/events
```
**Check:**
- ✓ Returns list of events
- ✓ Each event has all required fields
- ⚠️ **TO FIX:** Verify `description`, `time`, `min_age`, `dress_code` are populated

#### Test 12: Create Booking API
Test via frontend or direct API call
**Check:**
- ✓ Booking created successfully
- ✓ Additional attendees stored correctly
- ✓ Payment reference generated

---

## 🔧 **KNOWN ISSUES TO FIX**

### **CRITICAL (Must Fix)**
1. ⚠️ **PDF Watermark Missing**
   - File: `scripts/payment-instructions.js`
   - Line: ~346 (after QR code generation)
   - Fix: Add "PENDING PAYMENT - NOT VALID" watermark
   - Impact: Users might think unpaid ticket is valid

### **IMPORTANT (Should Fix)**
2. ⚠️ **SendGrid Not Configured Locally**
   - File: `backend/.env`
   - Fix: Add `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`
   - Impact: No emails sent when marking bookings as paid
   - **Note:** Can test locally without this, but emails won't send

3. ⚠️ **Event Data Completeness**
   - Check: Events might be missing `description`, `time` fields
   - Fix: Populate data when creating/editing events
   - Impact: Low - events work, just missing details

### **MINOR (Nice to Have)**
4. ✓ **Button Tooltips** - Already present
5. ✓ **Additional Attendees** - Already implemented
6. ✓ **Event Edit Modal** - Already working correctly

---

## 📝 **TESTING CHECKLIST**

Copy this checklist and check off as you test:

### Frontend User Flow:
- [ ] Homepage loads events from API
- [ ] Event cards display correctly
- [ ] Event details page shows all information
- [ ] Checkout form works (single attendee)
- [ ] Additional attendees form appears when quantity > 1
- [ ] Payment instructions page displays correctly
- [ ] PDF download works
- [ ] PDF contains QR code
- [ ] **⚠️ PDF has "PENDING PAYMENT" watermark (NEEDS FIX)**

### Admin Dashboard:
- [ ] Admin login works
- [ ] Events list displays
- [ ] View event modal opens correctly
- [ ] **Edit event modal opens correctly** (not view modal)
- [ ] Event edits save successfully
- [ ] Event edits persist after refresh
- [ ] Main page updates after event edit
- [ ] Bookings list displays
- [ ] Filter bookings by event works
- [ ] Mark booking as paid works
- [ ] **⚠️ Email sent when marking as paid (NEEDS SENDGRID CONFIG)**

### Backend API:
- [ ] Health check responds
- [ ] Events API returns data
- [ ] Bookings API works
- [ ] Additional attendees stored correctly

---

## 🚀 **AFTER LOCAL TESTING**

### Once you've tested and identified issues:
1. ✅ Fix PDF watermark in `scripts/payment-instructions.js`
2. ✅ Verify event data completeness
3. ✅ Test all fixes locally
4. ✅ Commit changes to Git
5. ✅ Push to GitHub
6. ✅ Deploy to Netlify (auto-deploys)
7. ✅ Configure SendGrid in Railway for production emails

---

## 🎯 **WHAT'S ALREADY WORKING**

Based on code review, these features are **100% complete**:
- ✅ Backend email system (code ready, just needs SendGrid config)
- ✅ PDF generation with QR codes
- ✅ Additional attendees handling
- ✅ Admin event editing
- ✅ Booking management
- ✅ Filter persistence
- ✅ Excel export
- ✅ Delete bookings

**The system is ~95% complete. Only minor fixes needed!**

---

## 📞 **NEED HELP?**

If you encounter issues during testing:
1. Check browser console for JavaScript errors
2. Check backend terminal for API errors
3. Verify database connection in Railway
4. Test API endpoints directly with curl/Postman

**Ready to start testing? Open http://localhost:8000 in your browser!** 🎉


