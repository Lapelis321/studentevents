# 🏦 Bank Transfer Implementation - Quick Start

**Status:** Ready to Implement  
**Estimated Time:** 2-3 hours  
**Current Progress:** Database migration created, checkout.html updated

---

## ⚡ **What I Need From You First:**

Before I continue implementing, please provide:

### 1. Bank Account Details
```
Recipient Name: _____________________ (e.g., "ISM Events Organization")
IBAN: _____________________________  (e.g., "LT12 3456 7890 1234 5678")
```

### 2. Pricing Structure
```
Base ticket price: €_____ (e.g., €20)
ISM student pricing: 
  [ ] ISM students pay base price, others pay +€1
  [ ] ISM students get €1 discount, others pay base price
```

### 3. Contact Email
```
Support email: _____________________ (for customer questions)
```

---

## 📊 **What's Been Done:**

✅ **Database Migration Created**
- File: `backend/supabase-bank-transfer-migration.sql`
- Creates `bookings` table
- Adds payment tracking
- Status: READY TO RUN

✅ **Checkout HTML Updated**
- Removed Stripe.js script
- Updated version numbers
- Ready for new form

---

## 🚀 **Next Steps (After You Provide Info):**

###  Step 1: Run Database Migration (5 min)
1. Go to: https://supabase.com/dashboard/project/vaoyiepnrizvvqokhcuu/sql
2. Copy/paste: `backend/supabase-bank-transfer-migration.sql`
3. Click "Run"

### Step 2: I'll Complete Implementation (1-2 hours)
- Update `checkout.js` (new booking logic)
- Create `payment-instructions.html` (bank transfer page)
- Create `payment-instructions.js` (display logic)
- Create `payment-instructions.css` (styling)
- Update `backend/railway-server.js` (new API endpoints)
- Update admin dashboard (booking management)

### Step 3: Configure Railway (2 min)
Add environment variables:
```env
BANK_RECIPIENT="Your Bank Account Name"
BANK_IBAN="Your IBAN"
```

### Step 4: Test & Deploy (30 min)
- Test complete flow
- Deploy to Vercel & Railway
- Verify everything works

---

## 💡 **Placeholder Option:**

If you want me to continue NOW with placeholders:
- I'll use: "ISM Events Organization" / "LT12 3456 7890 1234 5678"
- You can change these later in Railway environment variables
- Won't affect functionality, just displays

---

## 🎯 **What You'll Get:**

### For Customers:
1. Click "Buy Ticket"
2. Fill form (name, email, phone, ISM checkbox)
3. Submit → Get payment instructions page
4. See bank details + unique reference number
5. Make transfer within 24 hours
6. Receive ticket via email after admin confirms

### For You (Admin):
1. View all pending bookings in dashboard
2. Check bank account for transfers
3. Click "Confirm Payment" button
4. System auto-generates tickets + sends email
5. Track all bookings and payments

---

## ⏰ **Timeline:**

| Task | Time | Status |
|------|------|--------|
| Database migration | 5 min | ✅ Created |
| Frontend updates | 1 hour | ⏳ Waiting for your info |
| Backend updates | 1 hour | ⏳ Waiting for your info |
| Testing | 30 min | ⏳ Pending |
| Deployment | 10 min | ⏳ Pending |

---

**Ready to provide the bank details, or should I use placeholders and you'll update later?**

