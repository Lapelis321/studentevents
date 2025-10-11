# Remaining Implementation Tasks

## Status: 7 out of 9 Complete ✅

**Completed:**
1. ✅ Issue 2: Remove ISM discount (keep checkbox for tracking)
2. ✅ Issue 1: Fix booking design consistency
3. ✅ Issue 3: Real-time event updates on main page
4. ✅ Issue 7: Excel export for bookings
5. ✅ Additional A: Delete booking functionality
6. ✅ Additional B: Filter bookings by event
7. ✅ Issue 4: Auto-refresh bookings (every 10 seconds)

**Remaining:**
- ⏳ Issue 5: PDF ticket generation (pending payment watermark)
- ⏳ Issue 6: Email tickets on confirmation

---

## Issue 5: PDF Ticket Generation (Pending Payment)

### Requirements:
- Generate PDF on payment instructions page
- Include "PENDING PAYMENT - NOT VALID" watermark
- Complete ticket info: name, email, event details, ticket number, QR code

### Implementation Plan:

**Frontend Changes:**

1. **Add jsPDF libraries to `payment-instructions.html`:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

2. **Add download button to `payment-instructions.html`:**
```html
<button class="btn btn-secondary btn-large" onclick="paymentInstructions.downloadTicketPDF()">
    <i class="fas fa-download"></i>
    Download Pending Ticket (Not Valid Until Paid)
</button>
```

3. **Add PDF generation method to `scripts/payment-instructions.js`:**
```javascript
async downloadTicketPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add content with watermark
    // Generate QR code for ticket number
    // Download as PDF
}
```

---

## Issue 6: Email Tickets on Confirmation

### Requirements:
- Send email when admin marks booking as paid
- Generate one ticket per attendee (primary + additional)
- Each ticket has unique ticket number and QR code
- Include complete ticket info: name, email, event details

### Implementation Plan:

**Backend Changes:**

1. **Update `POST /api/admin/bookings/:id/confirm` endpoint:**
   - Retrieve booking + event data
   - Generate ticket numbers for each attendee
   - Generate QR codes
   - Create tickets in database
   - Send emails via SendGrid

2. **Create tickets table migration (if not exists):**
```sql
CREATE TABLE IF NOT EXISTS tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id),
    ticket_number VARCHAR(255) UNIQUE NOT NULL,
    attendee_first_name VARCHAR(255) NOT NULL,
    attendee_last_name VARCHAR(255) NOT NULL,
    attendee_email VARCHAR(255),
    qr_code TEXT,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. **Use existing SendGrid/QRCode libraries in `backend/railway-server.js`**

---

## Next Steps:

1. Test all completed features
2. Implement Issue 5 (PDF generation) - frontend only
3. Implement Issue 6 (email tickets) - requires backend work
4. Test complete flow
5. Deploy

---

## Testing Checklist:

**Completed Features:**
- [ ] ISM checkbox tracked but no discount applied
- [ ] Booking badges match Events styling
- [ ] Main page shows fresh events after admin edits
- [ ] Excel export works with all bookings
- [ ] Can delete bookings (permanent delete)
- [ ] Can filter bookings by event
- [ ] Bookings auto-refresh every 10 seconds

**Remaining Features:**
- [ ] Can download pending ticket PDF with watermark
- [ ] Email sent with valid ticket when marking as paid
- [ ] Each attendee gets unique ticket number and QR code

---

**Current Status:** Ready to implement PDF generation (Issue 5) and email tickets (Issue 6)

