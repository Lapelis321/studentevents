# ⚡ QUICK START - 3 Steps Only!

## ✅ STEP 1: Fix Settings Table (30 seconds)

In Supabase SQL Editor:
👉 https://supabase.com/dashboard/project/vaoyiepnrizvvqokhcuu/sql

**Run this file:** `backend/supabase-settings-fix.sql` (I just fixed the label column issue!)

**Expected:** Should see 7 rows in the result (all your settings)

---

## ✅ STEP 2: Check/Create Bookings Table (1 minute)

### 2A. Check if it exists:

Run: `backend/check-bookings-table.sql`

**If result is `TRUE`:** Skip to STEP 3 ✅  
**If result is `FALSE`:** Continue to 2B ⬇️

### 2B. Create bookings table:

Run: `backend/supabase-bank-transfer-migration.sql`

**Expected:** "Success. No rows returned"

---

## ✅ STEP 3: TEST THE BOOKING! (2 minutes)

1. Go to: **https://afterstateevents.vercel.app/**
2. Click on any event
3. Click **"Buy Ticket"**
4. Fill the form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Phone: `+370 600 12345`
   - ✅ Check "ISM Student"
   - Quantity: `1`
   - ✅ Accept terms
5. Click **"Continue to Payment Instructions"**

### 🎉 SUCCESS = You See:
- ✅ Payment instructions page
- ✅ Bank details (recipient, IBAN)
- ✅ Unique reference number
- ✅ Correct price

### ❌ ERROR = Check:
- Railway logs: https://railway.app/
- Browser console (F12)
- Supabase logs

---

## 🎯 That's It!

**Time:** 3-4 minutes total  
**Result:** Full booking system working! 🚀

---

## 📋 Verify in Database:

Go to: https://supabase.com/dashboard/project/vaoyiepnrizvvqokhcuu/editor

**Check `settings` table:**
- Should have 7 rows with bank details

**Check `bookings` table:**
- Should have your test booking
- Status: "pending"
- Reference: "TICKET-XXXXX"

---

## 🔧 Update Your Bank Details Later:

In Supabase → `settings` table → Edit these rows:
- `bank_recipient_name` → Your name
- `bank_iban` → Your IBAN (LT...)
- `base_ticket_price` → Your price
- `ism_student_discount` → Your fee

---

**START NOW!** Run `supabase-settings-fix.sql` in Supabase! ⚡

