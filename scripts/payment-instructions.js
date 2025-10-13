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
                    <li><strong>Reference Required:</strong> Use the exact reference number above in your transfer</li>
                    <li><strong>Ticket Delivery:</strong> You'll receive your confirmed ticket via email within 24 hours after payment confirmation. If not, <a href="mailto:${bankDetails.supportEmail || 'support@studentevents.com'}" style="color: var(--primary-500); text-decoration: underline;">contact support</a></li>
                    <li class="highlight-warning"><strong>Event Entry:</strong> A valid ticket is required for event entry. <span style="color: #dc2626; font-weight: 600;">If you did NOT pay for tickets, you will not be let in!</span></li>
                </ul>
            </div>

            <div class="actions-section">
                <button class="btn btn-primary btn-large" onclick="paymentInstructions.downloadTicketPDF()">
                    <i class="fas fa-ticket-alt"></i>
                    Download Ticket PDF
                </button>
                <button class="btn btn-secondary btn-large" onclick="paymentInstructions.downloadInstructions()">
                    <i class="fas fa-download"></i>
                    Download Instructions (Text)
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
Created: ${new Date().toLocaleString('en-US', { hour12: false })}
        `;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-instructions-${booking.payment_reference}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    async downloadTicketPDF() {
        console.log('🎫 PDF Generation v6.1.0 - Warning box removed');
        try {
            const { booking, event } = this.booking;
            const { jsPDF } = window.jspdf;
            
            if (!jsPDF) {
                alert('PDF library not loaded. Please refresh the page and try again.');
                return;
            }
            
            // Create PDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            
            // Add subtle border
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
            
            // Header
            doc.setFontSize(24);
            doc.setFont(undefined, 'bold');
            doc.text('STUDENT EVENTS', pageWidth / 2, 25, { align: 'center' });
            
            doc.setFontSize(16);
            doc.text('E-TICKET', pageWidth / 2, 35, { align: 'center' });
            
            // Reset text color
            doc.setTextColor(0, 0, 0);
            
            // Event Details
            let yPos = 50;
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('EVENT DETAILS', 15, yPos);
            
            yPos += 8;
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text(event.title || 'Event Name', 15, yPos);
            
            yPos += 7;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`Date: ${event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}`, 15, yPos);
            
            if (event.time) {
                yPos += 5;
                doc.text(`Time: ${event.time}`, 15, yPos);
            }
            
            yPos += 5;
            doc.text(`Location: ${event.location || 'TBD'}`, 15, yPos);
            
            if (event.min_age) {
                yPos += 5;
                doc.text(`Age Restriction: ${event.min_age}+`, 15, yPos);
            }
            
            if (event.dress_code) {
                yPos += 5;
                doc.text(`Dress Code: ${event.dress_code}`, 15, yPos);
            }
            
            // Attendee Details
            yPos += 12;
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('ATTENDEE INFORMATION', 15, yPos);
            
            yPos += 8;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Name: ${booking.first_name} ${booking.last_name}`, 15, yPos);
            
            yPos += 5;
            doc.text(`Email: ${booking.email}`, 15, yPos);
            
            yPos += 5;
            doc.text(`Phone: ${booking.phone}`, 15, yPos);
            
            yPos += 5;
            doc.text(`Tickets: ${booking.quantity}`, 15, yPos);
            
            yPos += 5;
            doc.setFont(undefined, 'bold');
            doc.text(`Total Amount: €${parseFloat(booking.total_amount).toFixed(2)}`, 15, yPos);
            
            // Ticket Number & QR Code
            yPos += 12;
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('TICKET NUMBER', 15, yPos);
            
            yPos += 8;
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(booking.payment_reference, 15, yPos);
            
            // Generate QR Code
            const qrContainer = document.createElement('div');
            qrContainer.style.display = 'none';
            document.body.appendChild(qrContainer);
            
            const qrCode = new QRCode(qrContainer, {
                text: booking.payment_reference,
                width: 128,
                height: 128
            });
            
            // Wait for QR code to generate
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const qrImage = qrContainer.querySelector('canvas');
            if (qrImage) {
                const qrDataUrl = qrImage.toDataURL('image/png');
                doc.addImage(qrDataUrl, 'PNG', pageWidth - 60, yPos - 10, 40, 40);
            }
            
            document.body.removeChild(qrContainer);
            
            // Small note at bottom
            yPos = pageHeight - 45;
            doc.setFontSize(7);
            doc.setTextColor(60, 60, 60);
            doc.text('Note: This ticket is only valid after payment confirmation.', pageWidth / 2, yPos, { align: 'center' });
            
            // Footer
            yPos = pageHeight - 30;
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('For support, please contact: support@studentevents.com', pageWidth / 2, yPos, { align: 'center' });
            yPos += 5;
            doc.text('A valid ticket is required for event entry', pageWidth / 2, yPos, { align: 'center' });
            
            // Save PDF
            doc.save(`ticket-${booking.payment_reference}.pdf`);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
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

