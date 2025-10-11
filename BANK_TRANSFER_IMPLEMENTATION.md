# 🏦 Bank Transfer Payment Implementation

**Date:** October 11, 2025  
**Change:** Replace Stripe online payment with bank transfer method  
**Status:** Ready to Implement

---

## 📋 **New Payment Flow**

### **User Journey:**

1. **Select Event & Tickets**
   - User browses events
   - Clicks "Buy Ticket"
   - Selects quantity

2. **Enter Personal Information**
   - First Name
   - Last Name
   - Phone Number
   - Email Address
   - Student Status: "ISM University student" or "Other (+€1)"

3. **Review & Submit**
   - See total amount
   - Submit booking request

4. **Bank Transfer Instructions Page**
   - Show payment details:
     - **Recipient:** [Your Name/Company]
     - **IBAN:** [Your IBAN]
     - **Amount:** €XX.XX
     - **Reference:** `TICKET-[BOOKING-ID]`
   - Important notes:
     - Transfer within 24 hours
     - Use exact reference number
     - Ticket sent after payment confirmed
   - Download button (PDF with instructions)

5. **Admin Confirms Payment**
   - Admin checks bank account
   - Marks payment as received in dashboard
   - System sends ticket via email automatically

6. **Customer Receives Ticket**
   - Email with QR code
   - Ready for event entry

---

## 🎯 **Database Schema Changes**

### **New `bookings` table:**

```sql
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  is_ism_student BOOLEAN DEFAULT false,
  
  -- Booking Details
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Payment Details
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'expired', 'cancelled')),
  payment_reference VARCHAR(100) UNIQUE NOT NULL, -- TICKET-XXXXX
  payment_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_bookings_email (email),
  INDEX idx_bookings_payment_reference (payment_reference),
  INDEX idx_bookings_payment_status (payment_status)
);
```

### **Update `tickets` table:**

```sql
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS issued_at TIMESTAMP WITH TIME ZONE;
```

---

## 🔧 **Files to Modify**

### 1. **`checkout.html`**

**Changes:**
- Remove Stripe.js script
- Update form fields
- Add ISM student checkbox
- Remove card payment fields

**New Form Fields:**
```html
<div class="form-group">
  <label for="firstName">First Name *</label>
  <input type="text" id="firstName" required>
</div>

<div class="form-group">
  <label for="lastName">Last Name *</label>
  <input type="text" id="lastName" required>
</div>

<div class="form-group">
  <label for="phone">Phone Number *</label>
  <input type="tel" id="phone" required>
</div>

<div class="form-group">
  <label for="email">Email Address *</label>
  <input type="email" id="email" required>
</div>

<div class="form-group checkbox-group">
  <label class="checkbox-label">
    <input type="checkbox" id="ismStudent">
    <span>I am an ISM University of Management and Economics student</span>
  </label>
  <p class="help-text">Non-ISM students pay +€1 extra</p>
</div>
```

---

### 2. **`scripts/checkout.js`**

**Changes:**
- Remove Stripe integration
- Add bank transfer booking logic
- Calculate price with ISM discount
- Generate payment reference

**New Key Functions:**

```javascript
class CheckoutManager {
  calculateTotal() {
    const basePrice = parseFloat(this.event.price);
    const quantity = parseInt(this.quantity);
    const isISMStudent = document.getElementById('ismStudent')?.checked || false;
    
    const subtotal = basePrice * quantity;
    const discount = isISMStudent ? 0 : 1; // €1 extra for non-ISM
    const total = subtotal + (discount * quantity);
    
    return { subtotal, discount, total };
  }
  
  generatePaymentReference() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `TICKET-${timestamp}-${random}`;
  }
  
  async submitBooking() {
    const formData = {
      eventId: this.event.id,
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      isISMStudent: document.getElementById('ismStudent').checked,
      quantity: this.quantity,
      paymentReference: this.generatePaymentReference()
    };
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const booking = await response.json();
    
    // Store booking for next page
    sessionStorage.setItem('pendingBooking', JSON.stringify(booking));
    
    // Redirect to payment instructions
    window.location.href = 'payment-instructions.html';
  }
}
```

---

### 3. **`payment-instructions.html`** (NEW FILE)

Create a new page showing bank transfer details:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Instructions - StudentEvents</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/payment-instructions.css">
</head>
<body>
    <div class="container">
        <div class="instructions-card">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            
            <h1>Booking Confirmed!</h1>
            <p class="subtitle">Complete your payment to receive your ticket</p>
            
            <div class="booking-summary">
                <h2>Booking Details</h2>
                <div class="detail-row">
                    <span>Event:</span>
                    <strong id="eventName"></strong>
                </div>
                <div class="detail-row">
                    <span>Tickets:</span>
                    <strong id="ticketQuantity"></strong>
                </div>
                <div class="detail-row">
                    <span>Total Amount:</span>
                    <strong id="totalAmount" class="amount"></strong>
                </div>
            </div>
            
            <div class="payment-details">
                <h2>Bank Transfer Details</h2>
                <p class="warning">⚠️ Please use the EXACT reference number when transferring</p>
                
                <div class="bank-info">
                    <div class="info-row">
                        <label>Recipient:</label>
                        <div class="info-value">
                            <span id="recipient">ISM Events Organization</span>
                            <button class="copy-btn" onclick="copyToClipboard('recipient')">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <label>IBAN:</label>
                        <div class="info-value">
                            <span id="iban">LT12 3456 7890 1234 5678</span>
                            <button class="copy-btn" onclick="copyToClipboard('iban')">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <label>Amount:</label>
                        <div class="info-value">
                            <span id="amount">€25.00</span>
                            <button class="copy-btn" onclick="copyToClipboard('amount')">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="info-row highlight">
                        <label>Reference:</label>
                        <div class="info-value">
                            <span id="reference">TICKET-XXXXX</span>
                            <button class="copy-btn" onclick="copyToClipboard('reference')">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="important-notes">
                <h3>⏰ Important Information</h3>
                <ul>
                    <li><strong>Payment Deadline:</strong> Transfer within 24 hours</li>
                    <li><strong>Reference Required:</strong> Use the exact reference number above</li>
                    <li><strong>Ticket Delivery:</strong> You'll receive your ticket via email within 24 hours after payment is confirmed</li>
                    <li><strong>No Payment?</strong> Your booking will be automatically cancelled after 24 hours</li>
                    <li><strong>No Ticket?</strong> If you don't receive your ticket within 24h after transfer, contact our support team</li>
                    <li><strong>Event Entry:</strong> Without a valid ticket, you will not be allowed into the event</li>
                </ul>
            </div>
            
            <div class="actions">
                <button class="btn btn-primary" onclick="downloadInstructions()">
                    <i class="fas fa-download"></i>
                    Download Instructions (PDF)
                </button>
                
                <a href="index.html" class="btn btn-secondary">
                    Back to Events
                </a>
            </div>
            
            <div class="contact-info">
                <p>Questions? Email us at <a href="mailto:support@studentevents.com">support@studentevents.com</a></p>
            </div>
        </div>
    </div>
    
    <script src="scripts/payment-instructions.js"></script>
</body>
</html>
```

---

### 4. **`backend/railway-server.js`**

**New API Endpoints:**

```javascript
// POST /api/bookings - Create booking
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      eventId,
      firstName,
      lastName,
      email,
      phone,
      isISMStudent,
      quantity,
      paymentReference
    } = req.body;
    
    // Get event details
    const event = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (event.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const eventData = event.rows[0];
    const unitPrice = parseFloat(eventData.price);
    const discount = isISMStudent ? 0 : 1;
    const totalAmount = (unitPrice + discount) * quantity;
    
    // Set payment deadline (24 hours from now)
    const paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Create booking
    const result = await pool.query(`
      INSERT INTO bookings (
        event_id, first_name, last_name, email, phone,
        is_ism_student, quantity, unit_price, discount,
        total_amount, payment_reference, payment_deadline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      eventId, firstName, lastName, email, phone,
      isISMStudent, quantity, unitPrice, discount,
      totalAmount, paymentReference, paymentDeadline
    ]);
    
    res.json({
      booking: result.rows[0],
      event: eventData,
      bankDetails: {
        recipient: process.env.BANK_RECIPIENT || 'ISM Events Organization',
        iban: process.env.BANK_IBAN || 'LT12 3456 7890 1234 5678',
        amount: totalAmount.toFixed(2),
        reference: paymentReference
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// POST /api/admin/bookings/:id/confirm-payment - Admin confirms payment
app.post('/api/admin/bookings/:id/confirm-payment', verifyAdminToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Update booking status
    await pool.query(`
      UPDATE bookings 
      SET payment_status = 'paid', paid_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [bookingId]);
    
    // Get booking details
    const booking = await pool.query(`
      SELECT b.*, e.title, e.date, e.location, e.image_url
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.id = $1
    `, [bookingId]);
    
    const bookingData = booking.rows[0];
    
    // Generate tickets
    const tickets = [];
    for (let i = 0; i < bookingData.quantity; i++) {
      const ticketNumber = `${bookingData.payment_reference}-${i + 1}`;
      const qrData = await QRCode.toDataURL(ticketNumber);
      
      const ticket = await pool.query(`
        INSERT INTO tickets (
          event_id, booking_id, email, ticket_number,
          qr_code, status
        ) VALUES ($1, $2, $3, $4, $5, 'active')
        RETURNING *
      `, [
        bookingData.event_id,
        bookingId,
        bookingData.email,
        ticketNumber,
        qrData
      ]);
      
      tickets.push(ticket.rows[0]);
    }
    
    // Send ticket email
    await sendTicketEmail(bookingData, tickets);
    
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// GET /api/admin/bookings - Get all bookings
app.get('/api/admin/bookings', verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, e.title as event_title
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      ORDER BY b.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});
```

---

### 5. **Admin Dashboard Updates**

Add new section for managing bookings:

**New Features:**
- View pending payments
- Confirm payment received
- Send ticket manually
- Cancel expired bookings

---

## 🎯 **Configuration Required**

### **Environment Variables (Railway):**

Add these to Railway:
```env
BANK_RECIPIENT="ISM Events Organization"
BANK_IBAN="LT12 3456 7890 1234 5678"
```

---

## 📊 **Payment Status Flow**

```
PENDING → (Admin confirms) → PAID → (Auto generate tickets) → (Send email)
   ↓
(24h timeout)
   ↓
EXPIRED → (Booking cancelled)
```

---

## ✅ **Advantages of Bank Transfer**

1. **No Payment Gateway Fees** - Save 2-3% per transaction
2. **Simple for Students** - Everyone has a bank account
3. **Manual Control** - Admin verifies payments
4. **Common in Europe** - Familiar payment method
5. **No PCI Compliance** - No card data handling

---

## ⚠️ **Considerations**

1. **Manual Work** - Admin must check bank and confirm payments
2. **Delayed Tickets** - Not instant like card payments
3. **Abandoned Bookings** - Some people may not complete transfer
4. **Bank Checking** - Need process to check transfers daily

---

## 🚀 **Implementation Steps**

1. Create database migrations (bookings table)
2. Update checkout page (remove Stripe, add form)
3. Create payment instructions page
4. Add backend API endpoints
5. Update admin dashboard (booking management)
6. Test complete flow
7. Deploy to production

---

**Ready to implement? I can start with any part you'd like!**

