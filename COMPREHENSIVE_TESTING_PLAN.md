# Comprehensive Testing Plan - StudentEvents System

## Phase 8: Testing & Validation

### 8.1 Backend API Testing

#### 8.1.1 Authentication & Authorization Tests
- [ ] Test admin login with valid/invalid credentials
- [ ] Test worker/supervisor login with valid/invalid credentials
- [ ] Test JWT token generation and validation
- [ ] Test role-based access control (admin, worker, supervisor)
- [ ] Test token expiration handling
- [ ] Test unauthorized access to protected endpoints

#### 8.1.2 Events API Tests
- [ ] Test GET /api/events (list all events)
- [ ] Test GET /api/events/:id (single event)
- [ ] Test POST /api/events (create event - admin only)
- [ ] Test PUT /api/events/:id (update event - admin only)
- [ ] Test DELETE /api/events/:id (delete event - admin only)
- [ ] Test event validation (required fields, date format, price format)
- [ ] Test sold_tickets counter updates correctly

#### 8.1.3 Bookings API Tests
- [ ] Test POST /api/bookings (create booking)
- [ ] Test POST /api/bookings/manual (admin manual booking)
- [ ] Test GET /api/bookings (list with filters)
- [ ] Test GET /api/bookings/:id (single booking)
- [ ] Test PUT /api/bookings/:id (update booking status)
- [ ] Test DELETE /api/bookings/:id (delete booking)
- [ ] Test GET /api/bookings/:id/ticket (PDF generation)
- [ ] Test payment status updates (pending → paid)
- [ ] Test additional attendees handling
- [ ] Test ticket number uniqueness

#### 8.1.4 Workers API Tests
- [ ] Test POST /api/workers (create worker)
- [ ] Test GET /api/workers (list workers)
- [ ] Test GET /api/workers/:id (single worker)
- [ ] Test PUT /api/workers/:id (update worker)
- [ ] Test DELETE /api/workers/:id (delete worker)
- [ ] Test GET /api/workers/export/all (CSV export)
- [ ] Test worker event assignment

#### 8.1.5 Settings & Policies API Tests
- [ ] Test GET /api/settings (all settings)
- [ ] Test PUT /api/settings/:key (update setting)
- [ ] Test GET /api/policies/:type (get policy)
- [ ] Test PUT /api/policies/:type (update policy)
- [ ] Test GET /api/policies/:type/pdf (PDF generation)
- [ ] Test GET /api/settings/backup (data backup)
- [ ] Test POST /api/settings/reset (data reset)

#### 8.1.6 Upload API Tests
- [ ] Test POST /api/upload/image (image upload to Cloudinary)
- [ ] Test file size limits (5MB max)
- [ ] Test file type validation (images only)
- [ ] Test DELETE /api/upload/image/:publicId (delete image)

---

### 8.2 Frontend Integration Tests

#### 8.2.1 Admin Dashboard Tests
- [ ] Test admin login flow
- [ ] Test logout functionality
- [ ] Test navigation between tabs (Events, Bookings, Workers, Settings)
- [ ] Test auto-refresh every 30 seconds
- [ ] Test event creation with image upload
- [ ] Test event edit and delete
- [ ] Test booking search and filter
- [ ] Test manual participant addition
- [ ] Test worker creation/edit/delete
- [ ] Test settings updates (payment, contact, organization)
- [ ] Test policy editing
- [ ] Test data export (events, bookings, workers)
- [ ] Test system backup and reset

#### 8.2.2 Worker/Supervisor Dashboard Tests
- [ ] Test worker login and role-based redirect
- [ ] Test supervisor login and role-based redirect
- [ ] Test QR code scanning (manual search)
- [ ] Test ticket verification (valid, pending, invalid)
- [ ] Test supervisor payment confirmation
- [ ] Test supervisor participant list view
- [ ] Test logout functionality

#### 8.2.3 Public Website Tests
- [ ] Test homepage event list loading
- [ ] Test event filtering by status
- [ ] Test event details page
- [ ] Test booking form (single and multiple tickets)
- [ ] Test additional attendee fields
- [ ] Test payment method selection
- [ ] Test Stripe payment flow
- [ ] Test manual bank transfer flow
- [ ] Test booking confirmation page
- [ ] Test ticket PDF download
- [ ] Test rules & policy page
- [ ] Test contacts page

---

### 8.3 End-to-End Test Scenarios

#### 8.3.1 Complete Event Lifecycle
1. [ ] Admin creates new event with image
2. [ ] Event appears on public homepage
3. [ ] User books tickets (Stripe payment)
4. [ ] Admin sees booking in dashboard
5. [ ] Email sent with ticket PDF
6. [ ] Worker scans ticket at event
7. [ ] Ticket validated successfully
8. [ ] Admin marks event as completed
9. [ ] Event hidden from public view

#### 8.3.2 Manual Bank Transfer Flow
1. [ ] User books tickets (Bank Transfer)
2. [ ] Booking status: Pending
3. [ ] User receives payment instructions
4. [ ] Ticket PDF shows "PENDING PAYMENT" watermark
5. [ ] User makes bank transfer
6. [ ] Admin confirms payment in dashboard
7. [ ] Booking status: Paid
8. [ ] User receives valid ticket PDF via email
9. [ ] Worker validates ticket successfully

#### 8.3.3 Worker Management Flow
1. [ ] Admin creates worker account
2. [ ] Admin assigns worker to event
3. [ ] Worker logs in with credentials
4. [ ] Worker redirected to dashboard (not supervisor)
5. [ ] Worker validates tickets for assigned event
6. [ ] Admin promotes worker to supervisor
7. [ ] Supervisor logs in
8. [ ] Supervisor sees additional permissions
9. [ ] Supervisor confirms manual payments

#### 8.3.4 Multi-Ticket Booking Flow
1. [ ] User selects 3 tickets for event
2. [ ] User fills in details for ticket holder 1
3. [ ] User fills in details for attendees 2 and 3
4. [ ] Total amount calculated correctly (3 × price)
5. [ ] Payment processed successfully
6. [ ] 3 separate QR codes generated
7. [ ] All attendee names shown on ticket
8. [ ] Each QR code validated independently

---

### 8.4 Database & Data Integrity Tests

#### 8.4.1 CRUD Verification
- [ ] Create: All entities (events, bookings, workers, etc.)
- [ ] Read: Single and list queries with filters
- [ ] Update: Verify changes persist immediately
- [ ] Delete: Verify cascading deletes where applicable
- [ ] Test concurrent updates (race conditions)
- [ ] Test transaction rollbacks on errors

#### 8.4.2 Data Validation Tests
- [ ] Test email format validation
- [ ] Test phone number format validation
- [ ] Test date/time validation (past dates rejected)
- [ ] Test price validation (positive numbers only)
- [ ] Test ticket quantity limits
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention in text fields

#### 8.4.3 Real-time Updates Tests
- [ ] Create event → immediately visible in dashboard
- [ ] Update event → changes reflect without refresh
- [ ] Delete event → removed from all views
- [ ] Confirm payment → booking status updates
- [ ] Sold tickets counter updates in real-time
- [ ] Auto-refresh loads latest data every 30 seconds

---

### 8.5 Security & Performance Tests

#### 8.5.1 Security Tests
- [ ] Test CORS configuration (Vercel domain allowed)
- [ ] Test authentication token security
- [ ] Test password hashing (bcrypt)
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Test CSRF protection
- [ ] Test file upload security (type, size limits)
- [ ] Test environment variable protection
- [ ] Test admin-only endpoint protection

#### 8.5.2 Performance Tests
- [ ] Test page load time (< 3 seconds)
- [ ] Test API response time (< 500ms)
- [ ] Test database query performance
- [ ] Test concurrent user handling (10+ simultaneous bookings)
- [ ] Test image upload performance (< 5 seconds)
- [ ] Test PDF generation performance (< 2 seconds)
- [ ] Test large dataset handling (100+ events, 1000+ bookings)

#### 8.5.3 Error Handling Tests
- [ ] Test 404 errors (not found)
- [ ] Test 401 errors (unauthorized)
- [ ] Test 403 errors (forbidden)
- [ ] Test 500 errors (server errors)
- [ ] Test network failure handling
- [ ] Test database connection failure
- [ ] Test email service failure
- [ ] Test payment service failure
- [ ] Test graceful error messages to users

---

### 8.6 Mobile & Browser Compatibility Tests

#### 8.6.1 Browser Tests
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)
- [ ] Test on mobile browsers (iOS Safari, Chrome Mobile)

#### 8.6.2 Responsive Design Tests
- [ ] Test on desktop (1920×1080)
- [ ] Test on laptop (1366×768)
- [ ] Test on tablet (768×1024)
- [ ] Test on mobile (375×667)
- [ ] Test modal responsiveness
- [ ] Test form usability on mobile
- [ ] Test navigation on small screens

---

### 8.7 Deployment & Production Tests

#### 8.7.1 Railway Backend Tests
- [ ] Test health endpoint (/health)
- [ ] Test version endpoint (/api/version)
- [ ] Test environment variables loaded correctly
- [ ] Test database connection (Supabase pooler)
- [ ] Test CORS works with Vercel frontend
- [ ] Test auto-deploy from GitHub
- [ ] Test logs and error reporting

#### 8.7.2 Vercel Frontend Tests
- [ ] Test production build succeeds
- [ ] Test all static assets load
- [ ] Test API requests to Railway backend
- [ ] Test favicon loads correctly
- [ ] Test logo displays correctly
- [ ] Test auto-deploy from GitHub

#### 8.7.3 Supabase Database Tests
- [ ] Test connection pooling (port 6543)
- [ ] Test SSL connection
- [ ] Test query performance
- [ ] Test triggers (updated_at, sold_tickets)
- [ ] Test backup and restore
- [ ] Test RLS policies (optional for backend-controlled security)

---

### 8.8 User Acceptance Testing (UAT)

#### 8.8.1 Admin User Tests
- [ ] Admin can create and manage events easily
- [ ] Admin can view and manage all bookings
- [ ] Admin can confirm manual bank transfer payments
- [ ] Admin can add participants manually
- [ ] Admin can manage worker accounts
- [ ] Admin can update system settings
- [ ] Admin can edit policies
- [ ] Admin can export data
- [ ] Admin can reset system data

#### 8.8.2 Worker/Supervisor User Tests
- [ ] Worker can login and see assigned events
- [ ] Worker can validate tickets quickly
- [ ] Worker sees clear validation status (Valid/Pending/Invalid)
- [ ] Supervisor has all worker permissions
- [ ] Supervisor can confirm payments
- [ ] Supervisor can view full participant list
- [ ] UI is clear and easy to use

#### 8.8.3 Public User Tests
- [ ] User can browse events easily
- [ ] User can view event details
- [ ] User can book tickets smoothly
- [ ] User can add multiple attendees
- [ ] User can choose payment method
- [ ] User receives confirmation email
- [ ] User can download ticket PDF
- [ ] User can view rules and policies
- [ ] User can find contact information

---

### 8.9 Regression Testing

After any code changes, re-test:
- [ ] Core flows (event creation, booking, ticket validation)
- [ ] Authentication and authorization
- [ ] CRUD operations for all entities
- [ ] Payment flows (Stripe and bank transfer)
- [ ] Email delivery
- [ ] PDF generation
- [ ] Data exports

---

## Test Execution Priority

### Critical (Must Test First)
1. Authentication and login flows
2. Event creation and management
3. Booking creation (both payment methods)
4. Ticket validation
5. CORS and API connectivity

### High Priority
1. Payment confirmation flows
2. Worker/Supervisor dashboards
3. Email delivery
4. PDF generation
5. Data exports

### Medium Priority
1. Admin settings management
2. Policy editing
3. Image uploads
4. Auto-refresh
5. Search and filters

### Low Priority (Nice to Have)
1. Browser compatibility
2. Mobile responsiveness
3. Performance optimization
4. Error messages polish
5. UI/UX improvements

---

## Testing Tools & Approach

### Manual Testing
- Use browser DevTools console for debugging
- Test all user flows end-to-end
- Document any bugs or issues found

### API Testing
- Use Postman or browser DevTools Network tab
- Test all endpoints with valid/invalid data
- Verify response codes and data format

### Database Testing
- Use Supabase dashboard SQL editor
- Verify data persistence after operations
- Check triggers and constraints

### Production Testing
- Test on actual Railway/Vercel URLs
- Verify environment variables work
- Test with real Stripe test keys
- Test email delivery with real SendGrid

---

## Bug Reporting Template

When you find a bug, report it with:

**Title:** Short description of the issue

**Priority:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:** What should happen

**Actual Result:** What actually happened

**Console Errors:** Any error messages

**Screenshots:** If applicable

**Environment:** Browser, OS, URL

---

## Test Sign-off

Once all critical and high-priority tests pass:

- [ ] All authentication flows work
- [ ] All CRUD operations work
- [ ] Payment flows work (both methods)
- [ ] Ticket validation works
- [ ] Email delivery works
- [ ] PDF generation works
- [ ] No critical bugs remain
- [ ] System ready for production use

**Tested by:** ___________
**Date:** ___________
**Status:** ☐ PASS  ☐ FAIL

