# 🏦 Bank Transfer System - Complete Deployment Guide

**Implementation:** Admin-Managed Bank Details  
**Complexity:** Moderate  
**Time:** 2-3 hours to implement, 15 minutes to deploy

---

## 🎯 **What You're Getting**

### For Customers:
1. Click "Buy Ticket" → Fill form (name, email, phone, ISM checkbox)
2. Submit → See payment instructions page with bank details
3. Make transfer with unique reference number within 24 hours
4. Wait for admin to confirm payment
5. Receive ticket via email with QR code

### For You (Admin):
1. **Settings Page:** Configure bank details, pricing, contact email
2. **Bookings Page:** View all pending payments in dashboard
3. **Confirm Payment:** Click button to mark as paid
4. **Auto-Send Ticket:** System generates QR code and emails ticket
5. **Track Everything:** See all bookings and their status

---

## 📋 **Deployment Steps**

### STEP 1: Run Database Migrations (5 minutes)

**Go to:** https://supabase.com/dashboard/project/vaoyiepnrizvvqokhcuu/sql

**Run these SQL files IN ORDER:**

1. **First:** `backend/supabase-settings-table.sql`
   - Creates settings table
   - Adds default bank details (you'll change these in admin)
   
2. **Second:** `backend/supabase-bank-transfer-migration.sql`
   - Creates bookings table
   - Links tickets to bookings

Click "Run" after pasting each one.

---

### STEP 2: Implement Frontend & Backend (I'll do this)

I need to create/update these files:

**Frontend Files:**
- ✅ `checkout.html` (already updated - removed Stripe)
- ⏳ `scripts/checkout.js` (new booking submission logic)
- ⏳ `payment-instructions.html` (new page)
- ⏳ `scripts/payment-instructions.js` (display bank details)
- ⏳ `styles/payment-instructions.css` (styling)

**Backend Files:**
- ⏳ `backend/railway-server.js` (add bookings + settings APIs)

**Admin Dashboard:**
- ⏳ `admin/settings.html` (new settings page)
- ⏳ `admin/scripts/settings.js` (settings management)
- ⏳ `admin/scripts/bookings.js` (booking management)
- ⏳ Update `admin/admin-dashboard.js` (add bookings section)

---

### STEP 3: Configure Initial Settings (2 minutes)

After deployment, you'll:

1. Go to: `https://afterstateevents.vercel.app/admin/`
2. Click "Settings" in sidebar
3. Update:
   - Bank Recipient Name
   - Bank IBAN
   - Base Ticket Price
   - Non-ISM Student Fee
   - Support Email

---

### STEP 4: Test Complete Flow (10 minutes)

1. **Book a ticket** as customer
2. **See payment instructions** with your real bank details
3. **Check admin** → See pending booking
4. **Confirm payment** → Click button
5. **Check email** → Ticket should arrive

---

## 💡 **Key Features**

### Settings Management
- Change bank details anytime without redeployment
- Update pricing on the fly
- Configure payment deadline (default: 24 hours)

### Booking Tracking
- See all bookings (pending, paid, expired)
- Filter by status
- Search by email or reference
- One-click payment confirmation

### Automatic Workflow
1. Customer books → Creates pending booking
2. Admin confirms → Generates tickets
3. System sends email → Customer receives ticket
4. Tickets have QR codes → Ready for scanning

### Safety Features
- Unique payment references
- 24-hour auto-expiry for unpaid bookings
- Can't double-confirm payments
- Email validation before sending

---

## 🎨 **Admin Dashboard Preview**

```
ADMIN DASHBOARD
├── Dashboard (Overview stats)
├── Events (Create/Edit/Delete)
├── Bookings (NEW!)
│   ├── Pending Payments (action required)
│   ├── Confirmed Bookings
│   ├── Expired Bookings
│   └── Search & Filter
├── Settings (NEW!)
│   ├── Payment Settings
│   │   ├── Bank Recipient
│   │   ├── IBAN
│   │   └── Payment Deadline
│   ├── Pricing Settings
│   │   ├── Base Ticket Price
│   │   └── Non-ISM Fee
│   └── General Settings
│       ├── Organization Name
│       └── Support Email
└── Workers (QR Scanner)
```

---

## 📊 **Database Schema**

### `settings` table
```sql
id, key, value, label, description, category, updated_at
```

### `bookings` table
```sql
id, event_id, first_name, last_name, email, phone,
is_ism_student, quantity, unit_price, discount, total_amount,
payment_status, payment_reference, payment_deadline, paid_at,
created_at, updated_at
```

### `tickets` table (updated)
```sql
... existing columns ...
+ booking_id (links ticket to booking)
+ issued_at (when ticket was generated)
```

---

## 🔄 **Payment Flow Diagram**

```
Customer                    System                      Admin
    |                          |                           |
    | 1. Book Ticket          |                           |
    |------------------------>|                           |
    |                          |                           |
    | 2. Get Payment Details  |                           |
    |<------------------------|                           |
    |                          |                           |
    | 3. Bank Transfer        |                           |
    | (24h deadline)          |                           |
    |                          |                           |
    |                          | 4. Shows in Dashboard    |
    |                          |------------------------->|
    |                          |                           |
    |                          | 5. Confirm Payment       |
    |                          |<-------------------------|
    |                          |                           |
    |                          | 6. Generate Tickets      |
    |                          | 7. Send Email           |
    |                          |                           |
    | 8. Receive Ticket       |                           |
    |<------------------------|                           |
```

---

## ⚠️ **Important Notes**

1. **First Time Setup:**
   - Default bank details are placeholders
   - Update them in Settings page immediately after deployment

2. **Email Requirement:**
   - SendGrid must be configured for ticket emails
   - Without it, you'll need to manually send tickets

3. **Payment Checking:**
   - You need to manually check your bank account
   - Then confirm payments in admin dashboard
   - Consider setting up bank notifications

4. **Expired Bookings:**
   - Auto-expire after 24 hours
   - Can be manually cancelled
   - Frees up ticket inventory

---

## 🚀 **Ready to Continue?**

I'll now implement all the remaining files. This will be a complete, production-ready bank transfer system with admin-managed settings!

**Should I proceed with the full implementation?**

