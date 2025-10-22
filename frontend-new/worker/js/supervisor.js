// Supervisor Dashboard Controller
const supervisor = {
  participants: [],
  assignedEvent: null,
  
  init() {
    this.checkAuth();
    this.loadParticipants();
    this.setupSearch();
  },
  
  checkAuth() {
    const token = localStorage.getItem('workerToken');
    const role = localStorage.getItem('workerRole');
    
    if (!token || role !== 'supervisor') {
      window.location.href = 'login.html';
      return;
    }
    
    const name = localStorage.getItem('workerName');
    document.getElementById('supervisorName').textContent = name || 'Supervisor';
  },
  
  async loadParticipants() {
    try {
      showLoading();
      const response = await fetchAPI('/api/workers/assigned-participants');
      this.participants = response.participants;
      this.assignedEvent = response.event;
      this.renderParticipants();
    } catch (error) {
      showNotification('Failed to load participants', 'error');
    } finally {
      hideLoading();
    }
  },
  
  renderParticipants(filtered = null) {
    const participants = filtered || this.participants;
    
    const tableHTML = `
      <table class="participants-table">
        <thead>
          <tr>
            <th>Ticket #</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Quantity</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${participants.map(p => `
            <tr>
              <td><code>${p.ticket_number}</code></td>
              <td>${p.first_name} ${p.last_name}</td>
              <td>${p.email}</td>
              <td>${p.phone}</td>
              <td>${p.quantity}</td>
              <td>€${p.total_amount}</td>
              <td><span class="badge badge-${p.payment_status}">${p.payment_status}</span></td>
              <td>
                ${p.payment_status === 'pending' ? `
                  <button onclick="supervisor.confirmPayment('${p.id}')" class="btn btn-sm btn-success">
                    Confirm Payment
                  </button>
                ` : `
                  <span style="color: var(--success);">
                    <i class="fas fa-check-circle"></i> Confirmed
                  </span>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    document.getElementById('participantsTable').innerHTML = tableHTML;
  },
  
  setupSearch() {
    const searchInput = document.getElementById('participantSearch');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = this.participants.filter(p =>
        p.first_name.toLowerCase().includes(query) ||
        p.last_name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.phone.includes(query) ||
        p.ticket_number.toLowerCase().includes(query)
      );
      this.renderParticipants(filtered);
    });
  },
  
  async confirmPayment(bookingId) {
    if (!confirm('Confirm payment for this participant?')) return;
    
    try {
      showLoading();
      await fetchAPI(`/api/bookings/${bookingId}/confirm`, 'POST');
      showNotification('Payment confirmed and tickets sent!', 'success');
      await this.loadParticipants();
    } catch (error) {
      showNotification('Failed to confirm payment', 'error');
    } finally {
      hideLoading();
    }
  },
  
  addParticipant() {
    showNotification('Add participant feature coming soon', 'info');
  },
  
  exportParticipants() {
    downloadJSON(this.participants, `participants-${Date.now()}.json`);
    showNotification('Participants exported successfully', 'success');
  }
};

// Ticket verification (shared with worker)
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
      <div style="background: var(--danger); color: white; padding: 16px; border-radius: 8px; text-align: center;">
        <i class="fas fa-times-circle"></i> INVALID TICKET
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
    statusHTML = `<div style="background: var(--success); color: white; padding: 16px; border-radius: 8px; font-weight: 700;">
      <i class="fas fa-check-circle"></i> VALID - ENTRY ALLOWED
    </div>`;
  } else if (data.payment_status === 'pending') {
    statusHTML = `<div style="background: var(--warning); color: white; padding: 16px; border-radius: 8px; font-weight: 700;">
      <i class="fas fa-exclamation-circle"></i> PENDING - ENTRY DENIED
    </div>`;
  } else {
    statusHTML = `<div style="background: var(--danger); color: white; padding: 16px; border-radius: 8px; font-weight: 700;">
      <i class="fas fa-times-circle"></i> INVALID
    </div>`;
  }
  
  resultDiv.innerHTML = `
    ${statusHTML}
    <div style="margin-top: 16px; text-align: left; background: var(--gray-50); padding: 16px; border-radius: 8px;">
      <strong>${data.first_name} ${data.last_name}</strong><br>
      <small>${data.email} | ${data.phone}</small><br>
      <small>Ticket: ${data.ticket_number} | Qty: ${data.quantity}</small>
    </div>
  `;
}

function logout() {
  localStorage.removeItem('workerToken');
  localStorage.removeItem('workerRole');
  localStorage.removeItem('workerName');
  window.location.href = 'login.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  supervisor.init();
  
  document.getElementById('ticketSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchTicket();
  });
});

