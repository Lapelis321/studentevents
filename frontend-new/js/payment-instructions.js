// =====================================================
// PAYMENT INSTRUCTIONS PAGE
// =====================================================

class PaymentInstructionsPage {
  constructor() {
    this.booking = null;
    this.init();
  }
  
  async init() {
    const bookingData = sessionStorage.getItem('pendingBooking');
    
    if (!bookingData) {
      showNotification('No booking found', 'error');
      setTimeout(() => window.location.href = '/', 1500);
      return;
    }
    
    this.booking = JSON.parse(bookingData);
    this.renderInstructions();
  }
  
  renderInstructions() {
    const container = document.getElementById('instructionsContent');
    const { booking, event, bankDetails } = this.booking;
    
    container.innerHTML = `
      <div class="info-card">
        <h2>Booking Details</h2>
        <div class="info-row">
          <span class="info-label">Event:</span>
          <span class="info-value">${event.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${booking.first_name} ${booking.last_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${booking.email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tickets:</span>
          <span class="info-value">${booking.quantity}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total Amount:</span>
          <span class="info-value" style="color: var(--primary-600); font-size: 20px;">€${parseFloat(booking.total_amount).toFixed(2)}</span>
        </div>
      </div>
      
      <div class="info-card">
        <h2><i class="fas fa-university"></i> Bank Transfer Details</h2>
        <p style="margin-bottom: 20px; color: var(--gray-600);">
          Use the <strong>EXACT reference number</strong> when making your transfer
        </p>
        
        <div class="bank-details">
          <div class="bank-row">
            <span class="bank-label">Recipient:</span>
            <span class="bank-value">
              ${bankDetails.recipient}
              <button class="copy-btn" onclick="paymentInstructionsPage.copyToClipboard('${bankDetails.recipient}')">
                <i class="fas fa-copy"></i> Copy
              </button>
            </span>
          </div>
          
          <div class="bank-row">
            <span class="bank-label">IBAN:</span>
            <span class="bank-value">
              ${bankDetails.iban}
              <button class="copy-btn" onclick="paymentInstructionsPage.copyToClipboard('${bankDetails.iban}')">
                <i class="fas fa-copy"></i> Copy
              </button>
            </span>
          </div>
          
          <div class="bank-row">
            <span class="bank-label">Amount:</span>
            <span class="bank-value">
              €${parseFloat(booking.total_amount).toFixed(2)}
              <button class="copy-btn" onclick="paymentInstructionsPage.copyToClipboard('${parseFloat(booking.total_amount).toFixed(2)}')">
                <i class="fas fa-copy"></i> Copy
              </button>
            </span>
          </div>
          
          <div class="bank-row">
            <span class="bank-label" style="color: var(--error);">Reference:</span>
            <span class="bank-value" style="color: var(--error); font-size: 18px;">
              ${booking.payment_reference}
              <button class="copy-btn" onclick="paymentInstructionsPage.copyToClipboard('${booking.payment_reference}')" style="background: var(--error); color: white;">
                <i class="fas fa-copy"></i> Copy
              </button>
            </span>
          </div>
        </div>
      </div>
      
      <div class="warning-box">
        <h3><i class="fas fa-exclamation-triangle"></i> Important Information</h3>
        <ul>
          <li><strong>Payment Deadline:</strong> Complete payment within 24 hours</li>
          <li><strong>Reference Required:</strong> Use the EXACT reference number above</li>
          <li><strong>Ticket Delivery:</strong> You'll receive tickets via email after payment is confirmed</li>
          <li><strong>Event Entry:</strong> Valid ticket required for entry. Unpaid bookings will NOT be admitted!</li>
        </ul>
      </div>
      
      <div class="action-buttons">
        <a href="/" class="btn btn-secondary">
          <i class="fas fa-home"></i> Back to Events
        </a>
        <button class="btn btn-primary" onclick="paymentInstructionsPage.downloadInstructions()">
          <i class="fas fa-file-alt"></i> Download Instructions
        </button>
      </div>
      
      <div style="margin-top: 30px; padding-top: 30px; border-top: 2px solid var(--gray-200);">
        <h3 style="text-align: center; margin-bottom: 16px; color: var(--gray-700);">
          <i class="fas fa-ticket-alt"></i> Your Ticket
        </h3>
        <p style="text-align: center; color: var(--gray-600); margin-bottom: 20px; font-size: 14px;">
          Download your ticket now. It will be valid only after payment is confirmed.
        </p>
        <button class="btn btn-primary btn-lg" onclick="paymentInstructionsPage.downloadTicket()" style="width: 100%; padding: 16px; font-size: 18px; font-weight: 700;">
          <i class="fas fa-download"></i> Download Ticket (PDF)
        </button>
      </div>
    `;
  }
  
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('Failed to copy', 'error');
    });
  }
  
  async downloadTicket() {
    const { booking } = this.booking;
    
    if (!booking || !booking.id) {
      showNotification('Booking information not found', 'error');
      return;
    }
    
    try {
      showLoading();
      
      // Request ticket PDF from backend
      const response = await fetch(`${window.CONFIG.API_BASE_URL}/bookings/${booking.id}/ticket`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('Failed to download ticket');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${booking.ticket_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showNotification('Ticket downloaded successfully!', 'success');
      
    } catch (error) {
      console.error('Download error:', error);
      showNotification('Failed to download ticket. Please try again.', 'error');
    } finally {
      hideLoading();
    }
  }
  
  downloadInstructions() {
    const { booking, event, bankDetails } = this.booking;
    
    const content = `
AFTERSTATE EVENTS - PAYMENT INSTRUCTIONS
=========================================

Booking Reference: ${booking.ticket_number}
Event: ${event.name}
Name: ${booking.first_name} ${booking.last_name}
Email: ${booking.email}
Tickets: ${booking.quantity}
Total Amount: €${parseFloat(booking.total_amount).toFixed(2)}

BANK TRANSFER DETAILS:
======================
Recipient: ${bankDetails.recipient}
IBAN: ${bankDetails.iban}
Amount: €${parseFloat(booking.total_amount).toFixed(2)}
Reference: ${booking.payment_reference}

IMPORTANT:
- Use the EXACT reference number: ${booking.payment_reference}
- Complete payment within 24 hours
- Tickets will be sent via email after confirmation
- Valid ticket required for event entry

For support: support@afterstate.events
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-instructions-${booking.ticket_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Instructions downloaded', 'success');
  }
}

// Initialize
let paymentInstructionsPage;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    paymentInstructionsPage = new PaymentInstructionsPage();
  });
} else {
  paymentInstructionsPage = new PaymentInstructionsPage();
}

