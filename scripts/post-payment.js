// ===== POST-PAYMENT PAGE JAVASCRIPT =====

class PostPayment {
    constructor() {
        this.orderData = null;
        this.init();
    }

    init() {
        this.loadOrderData();
    }

    loadOrderData() {
        // Get order data from sessionStorage
        const storedOrder = sessionStorage.getItem('orderData');
        
        if (storedOrder) {
            this.orderData = JSON.parse(storedOrder);
            this.renderConfirmation();
        } else {
            this.showErrorState('No order information found');
        }
    }

    renderConfirmation() {
        const container = document.getElementById('confirmationContainer');
        if (!container || !this.orderData) return;

        const formattedDate = this.formatEventDate(this.orderData.event.date);
        const formattedOrderDate = this.formatOrderDate(this.orderData.orderDate);
        const formattedTotal = EventTicketingApp.formatPrice(this.orderData.totalAmount, this.orderData.event.currency);

        container.innerHTML = `
            <div class="confirmation-success">
                <div class="success-icon">
                    <i class="fas fa-check"></i>
                </div>
                
                <h1 class="success-title">Payment Successful!</h1>
                <p class="success-subtitle">
                    Thank you for your purchase. You will receive an email confirmation with your ticket(s) shortly.
                </p>

                <div class="email-notification">
                    <i class="fas fa-envelope"></i>
                    <div class="email-notification-content">
                        <h3>Email Confirmation Sent</h3>
                        <p>Check your inbox for ticket details and QR codes. Don't forget to check your spam folder!</p>
                    </div>
                </div>

                <div class="order-details">
                    ${this.renderQRCode()}
                    
                    <h2>
                        <i class="fas fa-receipt"></i>
                        Order Details
                    </h2>
                    
                    <div class="order-info-grid">
                        <div class="order-info-section">
                            <h3>
                                <i class="fas fa-calendar-star"></i>
                                Event Information
                            </h3>
                            <div class="order-info-item">
                                <span class="order-info-label">Event:</span>
                                <span class="order-info-value">${this.orderData.event.title}</span>
                            </div>
                            <div class="order-info-item">
                                <span class="order-info-label">Date:</span>
                                <span class="order-info-value">${formattedDate}</span>
                            </div>
                            <div class="order-info-item">
                                <span class="order-info-label">Location:</span>
                                <span class="order-info-value">${this.orderData.event.location}</span>
                            </div>
                            <div class="order-info-item">
                                <span class="order-info-label">Tickets:</span>
                                <span class="order-info-value">${this.orderData.quantity} × ${EventTicketingApp.formatPrice(this.orderData.event.price, this.orderData.event.currency)}</span>
                            </div>
                        </div>
                        
                        <div class="order-info-section">
                            <h3>
                                <i class="fas fa-file-invoice"></i>
                                Order Information
                            </h3>
                            <div class="order-info-item">
                                <span class="order-info-label">Order #:</span>
                                <span class="order-info-value">${this.orderData.orderNumber}</span>
                            </div>
                            <div class="order-info-item">
                                <span class="order-info-label">Order Date:</span>
                                <span class="order-info-value">${formattedOrderDate}</span>
                            </div>
                            <div class="order-info-item">
                                <span class="order-info-label">Subtotal:</span>
                                <span class="order-info-value">${EventTicketingApp.formatPrice(this.orderData.event.price * this.orderData.quantity, this.orderData.event.currency)}</span>
                            </div>
                            <div class="order-info-item">
                                <span class="order-info-label">Service Fee:</span>
                                <span class="order-info-value">${EventTicketingApp.formatPrice(2.50, this.orderData.event.currency)}</span>
                            </div>
                            <div class="order-info-item order-total">
                                <span class="order-info-label">Total Paid:</span>
                                <span class="order-info-value">${formattedTotal}</span>
                            </div>
                        </div>
                    </div>

                    ${this.renderAttendeesList()}
                </div>

                <div class="action-buttons">
                    <button class="download-btn" onclick="postPayment.downloadTickets()">
                        <i class="fas fa-download"></i>
                        Download Tickets (PDF)
                    </button>
                    <a href="index.html" class="secondary-btn">
                        <i class="fas fa-calendar"></i>
                        Browse More Events
                    </a>
                </div>
            </div>
        `;

        // Clean up sessionStorage
        this.cleanupSessionStorage();
    }

    renderQRCode() {
        // Check if we have tickets with QR codes from the backend
        if (this.orderData.tickets && this.orderData.tickets.length > 0) {
            const ticketCards = this.orderData.tickets.map((ticket, index) => `
                <div class="ticket-qr-card">
                    <div class="qr-code-container">
                        <img src="${ticket.qrCodeUrl}" alt="QR Code Ticket ${index + 1}" class="qr-code-image">
                    </div>
                    <div class="ticket-number">
                        <svg class="globe-logo" viewBox="0 0 24 24" width="16" height="16">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                            <ellipse cx="12" cy="12" rx="10" ry="5" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                            <ellipse cx="12" cy="12" rx="10" ry="3" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                            <ellipse cx="12" cy="12" rx="10" ry="7" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                            <line x1="2" y1="8" x2="22" y2="8" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                            <line x1="2" y1="16" x2="22" y2="16" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                            <line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                            <line x1="2" y1="18" x2="22" y2="18" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                            <line x1="2" y1="4" x2="22" y2="4" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                            <line x1="2" y1="20" x2="22" y2="20" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                        </svg>
                        Ticket: ${ticket.ticketNumber}
                    </div>
                </div>
            `).join('');

            return `
                <div class="qr-tickets-section">
                    <h2>
                        <i class="fas fa-qrcode"></i>
                        Your Ticket${this.orderData.tickets.length > 1 ? 's' : ''}
                    </h2>
                    <p class="qr-instructions">
                        <i class="fas fa-info-circle"></i>
                        Show this QR code at the entrance. Save a screenshot or check your email for the ticket.
                    </p>
                    <div class="qr-tickets-grid">
                        ${ticketCards}
                    </div>
                </div>
            `;
        } else if (!this.orderData.isDemo) {
            // Real payment but no QR code yet (shouldn't happen)
            return `
                <div class="qr-tickets-section">
                    <h2>
                        <i class="fas fa-envelope"></i>
                        Tickets Sent to Email
                    </h2>
                    <p class="qr-instructions">
                        <i class="fas fa-info-circle"></i>
                        Your QR code tickets have been sent to your email. Please check your inbox.
                    </p>
                </div>
            `;
        } else {
            // Demo mode - no real tickets
            return `
                <div class="qr-tickets-section demo-notice">
                    <h2>
                        <i class="fas fa-flask"></i>
                        Demo Mode
                    </h2>
                    <p class="qr-instructions">
                        <i class="fas fa-info-circle"></i>
                        This is a demo purchase. In production, your QR code ticket would appear here.
                    </p>
                </div>
            `;
        }
    }

    renderAttendeesList() {
        if (!this.orderData.attendees || this.orderData.attendees.length === 0) {
            return '';
        }

        const attendeeItems = this.orderData.attendees.map((attendee, index) => `
            <div class="attendee-item">
                <i class="fas fa-user"></i>
                <span class="attendee-name">${attendee.firstName} ${attendee.lastName}</span>
            </div>
        `).join('');

        return `
            <div class="attendees-list">
                <h4>Attendees (${this.orderData.attendees.length})</h4>
                ${attendeeItems}
            </div>
        `;
    }

    downloadTickets() {
        // Simulate PDF generation and download
        EventTicketingApp.showNotification('Generating tickets...', 'info');
        
        setTimeout(() => {
            // Create a mock PDF download
            const pdfContent = this.generatePDFContent();
            const blob = new Blob([pdfContent], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `StudentEvents_Tickets_${this.orderData.orderNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            EventTicketingApp.showNotification('Tickets downloaded successfully!', 'success');
        }, 1500);
    }

    generatePDFContent() {
        // This is a mock PDF content - in a real application, you would use a PDF library
        const content = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
100 700 Td
(StudentEvents Ticket) Tj
0 -50 Td
/F1 16 Tf
(Event: ${this.orderData.event.title}) Tj
0 -30 Td
(Order: ${this.orderData.orderNumber}) Tj
0 -30 Td
(Date: ${this.formatEventDate(this.orderData.event.date)}) Tj
0 -30 Td
(Location: ${this.orderData.event.location}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000380 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF
        `;
        
        return content;
    }

    formatEventDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    formatOrderDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    cleanupSessionStorage() {
        // Clean up checkout-related data but keep order data for a while
        sessionStorage.removeItem('checkoutEvent');
        
        // Remove order data after 5 minutes to prevent accidental re-access
        setTimeout(() => {
            sessionStorage.removeItem('orderData');
        }, 5 * 60 * 1000);
    }

    showErrorState(message) {
        const container = document.getElementById('confirmationContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="confirmation-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Order Not Found</h2>
                <p>${message}</p>
                <a href="index.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Back to Events
                </a>
            </div>
        `;
    }
}

// Initialize post-payment page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.postPayment = new PostPayment();
});
