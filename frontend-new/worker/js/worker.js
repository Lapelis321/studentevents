// Worker Dashboard Controller
function checkAuth() {
  const token = localStorage.getItem('workerToken');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  const workerName = localStorage.getItem('workerName');
  document.getElementById('workerName').textContent = workerName || 'Worker';
}

function logout() {
  localStorage.removeItem('workerToken');
  localStorage.removeItem('workerRole');
  localStorage.removeItem('workerName');
  window.location.href = 'login.html';
}

function openQRScanner() {
  document.getElementById('qrScannerContainer').style.display = 'block';
  showNotification('Camera QR scanning feature coming soon!', 'info');
}

function closeQRScanner() {
  document.getElementById('qrScannerContainer').style.display = 'none';
}

async function searchTicket() {
  const query = document.getElementById('ticketSearch').value.trim();
  
  if (!query) {
    showNotification('Please enter a ticket number or name', 'error');
    return;
  }
  
  try {
    showLoading();
    
    const response = await fetchAPI('/api/workers/verify-ticket', 'POST', {
      query: query
    });
    
    displayTicketResult(response);
    
  } catch (error) {
    showNotification(error.message || 'Ticket not found', 'error');
    document.getElementById('ticketResult').innerHTML = `
      <div class="ticket-result">
        <div class="status-invalid">
          <i class="fas fa-times-circle"></i> INVALID TICKET
        </div>
        <p style="text-align: center; margin-top: 20px; color: var(--gray-600);">
          ${error.message || 'Ticket not found in the system'}
        </p>
      </div>
    `;
  } finally {
    hideLoading();
  }
}

function displayTicketResult(data) {
  const resultDiv = document.getElementById('ticketResult');
  
  let statusHTML = '';
  if (data.payment_status === 'paid') {
    statusHTML = `
      <div class="status-valid">
        <i class="fas fa-check-circle"></i> VALID TICKET - ENTRY ALLOWED
      </div>
    `;
  } else if (data.payment_status === 'pending') {
    statusHTML = `
      <div class="status-pending">
        <i class="fas fa-exclamation-circle"></i> PENDING PAYMENT - ENTRY DENIED
      </div>
    `;
  } else {
    statusHTML = `
      <div class="status-invalid">
        <i class="fas fa-times-circle"></i> INVALID TICKET
      </div>
    `;
  }
  
  resultDiv.innerHTML = `
    <div class="ticket-result">
      ${statusHTML}
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Event</div>
          <div class="info-value">${data.event_name || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Ticket Number</div>
          <div class="info-value">${data.ticket_number}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Name</div>
          <div class="info-value">${data.first_name} ${data.last_name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Email</div>
          <div class="info-value">${data.email}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Phone</div>
          <div class="info-value">${data.phone}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Quantity</div>
          <div class="info-value">${data.quantity}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Amount</div>
          <div class="info-value">€${data.total_amount}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Payment Status</div>
          <div class="info-value"><span class="badge badge-${data.payment_status}">${data.payment_status}</span></div>
        </div>
      </div>
    </div>
  `;
}

// Enter key support
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  document.getElementById('ticketSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchTicket();
    }
  });
});

