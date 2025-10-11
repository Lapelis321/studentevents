# ✅ Test Bank Transfer System - RIGHT NOW

**Status:** Backend API deployed, Railway redeploying (~2 minutes)  
**Action Required:** Run SQL migrations, then test

---

## 🚀 **STEP 1: Run SQL Migrations (5 minutes - DO THIS NOW)**

### Go to Supabase SQL Editor:
👉 https://supabase.com/dashboard/project/vaoyiepnrizvvqokhcuu/sql

### Run Migration 1 - Settings Table:

1. Click "New Query"
2. Copy/paste contents of `backend/supabase-settings-table.sql`
3. Click "RUN"
4. You should see: "Success. No rows returned" or "Success. 7 rows returned"

### Run Migration 2 - Bookings Table:

1. Click "New Query" again
2. Copy/paste contents of `backend/supabase-bank-transfer-migration.sql`
3. Click "RUN"
4. You should see: "Success. No rows returned"

---

## ⏰ **STEP 2: Wait for Railway (2 minutes)**

Railway is currently deploying the backend API with bookings endpoints.

**Check status:** https://railway.app/

Wait until you see "Active" status.

---

## 🧪 **STEP 3: Test Complete Booking Flow (5 minutes)**

### Test 1: Book a Ticket

1. Go to: https://afterstateevents.vercel.app/
2. Click on your event
3. Click "Buy Ticket"
4. Fill the form:
   - First Name: Test
   - Last Name: User
   - Email: your-email@example.com
   - Phone: +370 600 12345
   - [✓] Check ISM student (or leave unchecked)
   - Quantity: 1
   - [✓] Accept terms
5. Click "Continue to Payment Instructions"

**Expected Result:**
- ✅ Should redirect to payment instructions page
- ✅ Shows bank transfer details
- ✅ Shows unique reference number
- ✅ Shows correct amount

**If it fails:**
- Check browser console (F12)
- Check Railway logs for errors

### Test 2: Verify Booking in Database

1. Go to: https://supabase.com/dashboard/project/vaoyiepnrizvvqokhcuu/editor
2. Open `bookings` table
3. You should see your test booking:
   - First name, last name, email
   - Payment status: "pending"
   - Payment reference: "TICKET-XXXXX"
   - Payment deadline: 24 hours from now

### Test 3: Check Payment Instructions

On the payment instructions page, verify:
- ✅ Correct event name
- ✅ Your name and email
- ✅ Number of tickets
- ✅ Total amount (with or without ISM fee)
- ✅ Bank recipient name
- ✅ Bank IBAN
- ✅ Unique reference number
- ✅ Copy buttons work
- ✅ Download instructions works

---

## ✅ **SUCCESS CRITERIA**

You'll know it's working when:

1. ✅ Checkout form submits without errors
2. ✅ Payment instructions page loads
3. ✅ Booking appears in Supabase `bookings` table
4. ✅ Bank details display correctly
5. ✅ Unique reference number generated

---

## 🔧 **If Something Fails:**

### Error: "Failed to create booking"
**Cause:** Backend API not deployed yet or SQL migrations not run  
**Fix:** Wait 2 more minutes for Railway, then try again

### Error: "Database not available"
**Cause:** SQL migrations not run  
**Fix:** Run both SQL migration files in Supabase

### Error: "Event not found"
**Cause:** No events in database  
**Fix:** Create an event in admin dashboard first

### Error: Payment instructions show "undefined"
**Cause:** Settings table empty  
**Fix:** SQL migration 1 not run - run `supabase-settings-table.sql`

---

## 📊 **Current System Status**

| Component | Status | Next Step |
|-----------|--------|-----------|
| Frontend (Vercel) | ✅ Deployed | Test now |
| Backend (Railway) | 🔄 Deploying | Wait 2 min |
| Database (Supabase) | ⏳ Need migration | Run SQL |
| Bookings API | ✅ Code added | Test after SQL |
| Settings API | ✅ Code added | Test after SQL |

---

## 🎯 **Quick Test Checklist**

- [ ] SQL Migration 1 (Settings) - Run in Supabase
- [ ] SQL Migration 2 (Bookings) - Run in Supabase
- [ ] Railway shows "Active" status
- [ ] Create test booking via website
- [ ] See payment instructions page
- [ ] Verify booking in Supabase `bookings` table
- [ ] Bank details show correctly

---

## 💡 **After Testing Works:**

### Update Bank Details:
1. Go to Supabase → `settings` table
2. Edit these rows:
   - `bank_recipient_name` → Your name
   - `bank_iban` → Your real IBAN
   - `base_ticket_price` → Your price
   - `ism_student_discount` → Your fee

### Or use SQL:
```sql
UPDATE settings SET value = 'Your Bank Name' WHERE key = 'bank_recipient_name';
UPDATE settings SET value = 'LT12...' WHERE key = 'bank_iban';
UPDATE settings SET value = '25.00' WHERE key = 'base_ticket_price';
UPDATE settings SET value = '2.00' WHERE key = 'ism_student_discount';
```

---

## 🚀 **YOU'RE ALMOST DONE!**

**Completed:**
- ✅ Frontend checkout form
- ✅ Payment instructions page
- ✅ Backend API endpoints
- ✅ Database schema

**Just need:**
- ⏳ Run 2 SQL files (5 min)
- ⏳ Wait for Railway (2 min)
- ⏳ Test booking (2 min)

**Total:** 9 minutes until fully working!

---

**START WITH STEP 1 NOW:** Run the SQL migrations!

