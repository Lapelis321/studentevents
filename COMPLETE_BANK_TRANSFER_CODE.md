# 🏦 Complete Bank Transfer Implementation - All Remaining Code

**This document contains ALL code needed to complete the bank transfer system.**

Copy each section into the specified file.

---

## 📄 **File 1: payment-instructions.html**

Create this file in the project root:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Instructions - StudentEvents</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/payment-instructions.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="header-left">
                    <div class="logo">
                        <i class="fas fa-ticket-alt"></i>
                        <span>StudentEvents</span>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="main">
        <div class="container">
            <div class="instructions-container" id="instructionsContainer">
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading payment details...</p>
                </div>
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-links">
                    <a href="rules.html" class="footer-link">Rules & Policy</a>
                    <a href="#contact" class="footer-link">Contact</a>
                </div>
                <div class="footer-info">
                    <p>&copy; 2024 StudentEvents. All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>

    <script src="scripts/main.js"></script>
    <script>
        window.API_BASE_URL = 'https://studentevents-production.up.railway.app/api';
    </script>
    <script src="scripts/config.js?v=4.0.0"></script>
    <script src="scripts/payment-instructions.js?v=4.0.0"></script>
</body>
</html>
```

---

## 📄 **File 2: scripts/payment-instructions.js**

Create this file in `scripts/` folder:

```javascript
// ===== PAYMENT INSTRUCTIONS PAGE =====

class PaymentInstructions {
    constructor() {
        this.booking = null;
        this.init();
    }

    init() {
        this.loadBookingData();
    }

    loadBookingData() {
        const storedBooking = sessionStorage.getItem('pendingBooking');
        
        if (storedBooking) {
            this.booking = JSON.parse(storedBooking);
            this.renderInstructions();
        } else {
            this.showError();
        }
    }

    renderInstructions() {
        const container = document.getElementById('instructionsContainer');
        if (!container || !this.booking) return;

        const { booking, event, bankDetails } = this.booking;
        const deadline = this.formatDeadline(booking.payment_deadline);

        container.innerHTML = `
            <div class="success-header">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h1>Booking Confirmed!</h1>
                <p class="subtitle">Complete your payment to receive your ticket</p>
            </div>

            <div class="booking-summary-card">
                <h2>Booking Details</h2>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">Event:</span>
                        <strong>${event.title}</strong>
                    </div>
                    <div class="summary-item">
                        <span class="label">Name:</span>
                        <strong>${booking.first_name} ${booking.last_name}</strong>
                    </div>
                    <div class="summary-item">
                        <span class="label">Email:</span>
                        <strong>${booking.email}</strong>
                    </div>
                    <div class="summary-item">
                        <span class="label">Tickets:</span>
                        <strong>${booking.quantity}</strong>
                    </div>
                    <div class="summary-item highlight">
                        <span class="label">Total Amount:</span>
                        <strong class="amount">€${parseFloat(booking.total_amount).toFixed(2)}</strong>
                    </div>
                </div>
            </div>

            <div class="payment-card">
                <h2>Bank Transfer Details</h2>
                <p class="warning-text">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Important:</strong> Use the EXACT reference number when making the transfer
                </p>

                <div class="bank-details">
                    <div class="detail-row">
                        <label>Recipient:</label>
                        <div class="detail-value">
                            <span id="recipient">${bankDetails.recipient}</span>
                            <button class="copy-btn" onclick="paymentInstructions.copy('recipient')" title="Copy">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>

                    <div class="detail-row">
                        <label>IBAN:</label>
                        <div class="detail-value">
                            <span id="iban">${bankDetails.iban}</span>
                            <button class="copy-btn" onclick="paymentInstructions.copy('iban')" title="Copy">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>

                    <div class="detail-row">
                        <label>Amount:</label>
                        <div class="detail-value">
                            <span id="amount">€${bankDetails.amount}</span>
                            <button class="copy-btn" onclick="paymentInstructions.copy('amount')" title="Copy">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>

                    <div class="detail-row reference-row">
                        <label>Reference:</label>
                        <div class="detail-value">
                            <span id="reference">${booking.payment_reference}</span>
                            <button class="copy-btn" onclick="paymentInstructions.copy('reference')" title="Copy">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="important-info-card">
                <h3><i class="fas fa-clock"></i> Important Information</h3>
                <ul class="info-list">
                    <li><strong>Payment Deadline:</strong> ${deadline}</li>
                    <li><strong>Reference Required:</strong> Use the exact reference number above in your transfer</li>
                    <li><strong>Ticket Delivery:</strong> You'll receive your ticket via email within 24 hours after payment confirmation</li>
                    <li><strong>No Payment?</strong> Your booking will be automatically cancelled after the deadline</li>
                    <li><strong>No Ticket?</strong> If you don't receive your ticket within 24h after transfer, contact support</li>
                    <li><strong>Event Entry:</strong> A valid ticket is required for event entry</li>
                </ul>
            </div>

            <div class="actions-section">
                <button class="btn btn-primary btn-large" onclick="paymentInstructions.downloadInstructions()">
                    <i class="fas fa-download"></i>
                    Download Instructions
                </button>
                <a href="index.html" class="btn btn-secondary btn-large">
                    <i class="fas fa-home"></i>
                    Back to Events
                </a>
            </div>

            <div class="contact-footer">
                <p>Questions? Email us at <a href="mailto:support@studentevents.com">support@studentevents.com</a></p>
            </div>
        `;
    }

    copy(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const text = element.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            EventTicketingApp.showNotification('Copied to clipboard!', 'success');
        }).catch(() => {
            EventTicketingApp.showNotification('Failed to copy', 'error');
        });
    }

    downloadInstructions() {
        const { booking, event, bankDetails } = this.booking;
        
        const text = `
STUDENT EVENTS - PAYMENT INSTRUCTIONS
========================================

Event: ${event.title}
Name: ${booking.first_name} ${booking.last_name}
Email: ${booking.email}
Tickets: ${booking.quantity}
Total: €${parseFloat(booking.total_amount).toFixed(2)}

BANK TRANSFER DETAILS:
========================================
Recipient: ${bankDetails.recipient}
IBAN: ${bankDetails.iban}
Amount: €${bankDetails.amount}
Reference: ${booking.payment_reference}

IMPORTANT:
- Use the EXACT reference number: ${booking.payment_reference}
- Transfer within 24 hours
- Ticket sent to: ${booking.email}
- Questions? support@studentevents.com

Booking Reference: ${booking.payment_reference}
Created: ${new Date().toLocaleString()}
        `;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-instructions-${booking.payment_reference}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    formatDeadline(deadlineString) {
        const deadline = new Date(deadlineString);
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return deadline.toLocaleDateString('en-US', options);
    }

    showError() {
        const container = document.getElementById('instructionsContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Booking Not Found</h2>
                    <p>We couldn't find your booking information.</p>
                    <a href="index.html" class="btn btn-primary">
                        <i class="fas fa-home"></i>
                        Back to Events
                    </a>
                </div>
            `;
        }
    }
}

// Initialize
let paymentInstructions;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        paymentInstructions = new PaymentInstructions();
    });
} else {
    paymentInstructions = new PaymentInstructions();
}
```

---

## 📄 **File 3: styles/payment-instructions.css**

Create this file in `styles/` folder:

```css
/* Payment Instructions Page Styles */

.instructions-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
}

.loading-state {
    text-align: center;
    padding: 60px 20px;
}

.loading-state .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

.success-header {
    text-align: center;
    margin-bottom: 40px;
}

.success-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: scaleIn 0.5s ease-out;
}

.success-icon i {
    font-size: 40px;
    color: white;
}

.success-header h1 {
    font-size: 2rem;
    color: var(--color-text-primary);
    margin-bottom: 10px;
}

.success-header .subtitle {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
}

.booking-summary-card,
.payment-card,
.important-info-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
}

.booking-summary-card h2,
.payment-card h2,
.important-info-card h3 {
    font-size: 1.5rem;
    color: var(--color-text-primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.summary-grid {
    display: grid;
    gap: 15px;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--color-border);
}

.summary-item.highlight {
    border-bottom: 2px solid var(--color-primary);
    padding-top: 15px;
}

.summary-item .label {
    color: var(--color-text-secondary);
}

.summary-item strong {
    color: var(--color-text-primary);
}

.summary-item.highlight strong.amount {
    color: var(--color-primary);
    font-size: 1.5rem;
}

.warning-text {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 25px;
    display: flex;
    align-items: start;
    gap: 12px;
}

.warning-text i {
    color: #f59e0b;
    font-size: 20px;
    margin-top: 2px;
}

.warning-text strong {
    color: #92400e;
}

.bank-details {
    display: grid;
    gap: 20px;
}

.detail-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.detail-row label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detail-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--color-bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--color-border);
    font-family: 'Courier New', monospace;
    font-size: 1rem;
}

.detail-row.reference-row .detail-value {
    background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
    border-color: #8b5cf6;
    font-weight: 600;
    color: #5b21b6;
}

.copy-btn {
    background: transparent;
    border: none;
    color: var(--color-primary);
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: all 0.2s;
}

.copy-btn:hover {
    background: var(--color-primary);
    color: white;
}

.info-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.info-list li {
    padding: 12px 0;
    padding-left: 30px;
    position: relative;
    border-bottom: 1px solid var(--color-border);
}

.info-list li:last-child {
    border-bottom: none;
}

.info-list li:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: var(--color-primary);
    font-weight: bold;
    font-size: 18px;
}

.actions-section {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
}

.btn-large {
    flex: 1;
    padding: 16px 24px;
    font-size: 1rem;
}

.contact-footer {
    text-align: center;
    padding: 20px;
    color: var(--color-text-secondary);
}

.contact-footer a {
    color: var(--color-primary);
    text-decoration: none;
}

.contact-footer a:hover {
    text-decoration: underline;
}

.error-state {
    text-align: center;
    padding: 60px 20px;
}

.error-state i {
    font-size: 60px;
    color: #ef4444;
    margin-bottom: 20px;
}

.error-state h2 {
    font-size: 2rem;
    color: var(--color-text-primary);
    margin-bottom: 15px;
}

.error-state p {
    color: var(--color-text-secondary);
    margin-bottom: 30px;
}

@keyframes scaleIn {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    .actions-section {
        flex-direction: column;
    }
    
    .success-header h1 {
        font-size: 1.5rem;
    }
    
    .booking-summary-card,
    .payment-card,
    .important-info-card {
        padding: 20px;
    }
}
```

---

## ⚠️ **NEXT STEPS**

Due to message length limits, I need to stop here. 

**What's been created:**
✅ Checkout system (complete)
✅ Payment instructions page (complete)
✅ Database migrations (complete)

**What's still needed:**
⏳ Backend API endpoints (400 lines)
⏳ Admin settings page (300 lines)
⏳ Admin bookings page (400 lines)

**Should I continue in the next message with the remaining files?**

