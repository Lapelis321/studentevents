// Confirmation Page Handler
let bookingData = null;

async function init() {
  // Get booking ID from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('booking_id');
  const sessionId = urlParams.get('session_id');
  
  if (!bookingId) {
    showNotification('Booking information not found', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
    return;
  }
  
  try {
    showLoading();
    
    // If we have a Stripe session, verify it first
    if (sessionId) {
      await fetchAPI('/payments/verify-session', 'POST', {
        session_id: sessionId,
        booking_id: bookingId
      });
    }
    
    // Load booking details
    const response = await fetchAPI(`/bookings/${bookingId}`);
    bookingData = response;
    
    displayBookingDetails();
    loadSupportInfo();
    
  } catch (error) {
    showNotification('Failed to load booking details', 'error');
    console.error('Error:', error);
  } finally {
    hideLoading();
  }
}

function displayBookingDetails() {
  if (!bookingData) return;
  
  const detailsHTML = `
    <div class="detail-row">
      <span class="detail-label">Event</span>
      <span class="detail-value">${bookingData.event_name || 'N/A'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Ticket Number</span>
      <span class="detail-value"><code>${bookingData.ticket_number}</code></span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Name</span>
      <span class="detail-value">${bookingData.first_name} ${bookingData.last_name}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email</span>
      <span class="detail-value">${bookingData.email}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Quantity</span>
      <span class="detail-value">${bookingData.quantity} ticket${bookingData.quantity > 1 ? 's' : ''}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Total Amount</span>
      <span class="detail-value" style="font-size: 20px; color: var(--primary-600); font-weight: 700;">
        €${bookingData.total_amount}
      </span>
    </div>
  `;
  
  document.getElementById('bookingDetails').innerHTML = detailsHTML;
}

async function loadSupportInfo() {
  try {
    const settings = await fetchAPI('/settings');
    
    const supportEmail = settings.find(s => s.key === 'supportEmail')?.value || 'support@afterstate.events';
    const supportPhone = settings.find(s => s.key === 'supportPhone')?.value || '+370 XXX XXXXX';
    const workingHours = settings.find(s => s.key === 'workingHours')?.value || 'Mon-Fri 9:00-18:00';
    
    document.getElementById('supportInfo').innerHTML = `
      <div style="font-size: 14px; color: var(--gray-700);">
        <div><i class="fas fa-envelope"></i> ${supportEmail}</div>
        <div style="margin-top: 4px;"><i class="fas fa-phone"></i> ${supportPhone}</div>
        <div style="margin-top: 4px;"><i class="fas fa-clock"></i> ${workingHours}</div>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load support info', error);
  }
}

async function downloadTickets() {
  if (!bookingData) {
    showNotification('Booking data not available', 'error');
    return;
  }
  
  try {
    showLoading();
    
    // Request ticket PDF from backend
    const response = await fetch(`${window.CONFIG.API_BASE_URL}/bookings/${bookingData.id}/ticket`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error('Failed to download tickets');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${bookingData.ticket_number}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Tickets downloaded successfully', 'success');
    
  } catch (error) {
    showNotification('Failed to download tickets. Please check your email.', 'error');
    console.error('Error:', error);
  } finally {
    hideLoading();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

