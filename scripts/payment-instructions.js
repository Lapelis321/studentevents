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
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            EventTicketingApp.showNotification('Copied to clipboard!', 'success');
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

