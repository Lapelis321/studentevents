// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// API Request Helper
async function fetchAPI(endpoint, method = 'GET', data = null, isFormData = false) {
  const token = localStorage.getItem('adminToken');
  const url = `${window.CONFIG.API_BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  // Handle FormData (for file uploads) vs JSON
  if (data) {
    if (isFormData && data instanceof FormData) {
      options.body = data;
      // Don't set Content-Type header for FormData - browser sets it automatically with boundary
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  return await response.json();
}

// Show loading overlay
function showLoading() {
  let loader = document.getElementById('globalLoader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.innerHTML = '<div class="spinner"></div>';
    loader.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';
    document.body.appendChild(loader);
  }
  loader.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
  const loader = document.getElementById('globalLoader');
  if (loader) loader.style.display = 'none';
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Download JSON
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// =====================================================
// ADMIN DASHBOARD CONTROLLER
// =====================================================

const dashboard = {
  currentTab: 'events',
  autoRefreshInterval: null,
  autoRefreshEnabled: true,
  
  init() {
    this.checkAuth();
    this.setupNavigation();
    this.loadTab('events');
  },
  
  checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
  },
  
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = e.currentTarget.dataset.tab;
        
        navLinks.forEach(l => l.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        this.loadTab(tab);
      });
    });
  },
  
  loadTab(tabName) {
    this.currentTab = tabName;
    const tabContent = document.getElementById('tabContent');
    
    // Stop existing auto-refresh
    this.stopAutoRefresh();
    
    switch(tabName) {
      case 'events':
        eventsManager.render(tabContent);
        break;
      case 'bookings':
        bookingsManager.render(tabContent);
        break;
      case 'workers':
        workersManager.render(tabContent);
        break;
      case 'settings':
        settingsManager.render(tabContent);
        break;
    }
    
    // Start auto-refresh for data tabs (not settings)
    if (tabName !== 'settings' && this.autoRefreshEnabled) {
      this.startAutoRefresh();
    }
  },
  
  startAutoRefresh() {
    // Clear any existing interval
    this.stopAutoRefresh();
    
    // Refresh every 30 seconds
    this.autoRefreshInterval = setInterval(async () => {
      console.log('🔄 Auto-refreshing data...');
      
      try {
        switch(this.currentTab) {
          case 'events':
            await eventsManager.loadEvents();
            break;
          case 'bookings':
            await bookingsManager.loadBookings();
            break;
          case 'workers':
            await workersManager.loadWorkers();
            break;
        }
      } catch (error) {
        console.error('Auto-refresh error:', error);
      }
    }, 30000); // 30 seconds
  },
  
  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
  },
  
  logout() {
    this.stopAutoRefresh();
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
  }
};

// Events Manager
const eventsManager = {
  events: [],
  
  async render(container) {
    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value" id="totalEvents">0</div>
          <div class="stat-label">Total Events</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <div class="stat-value" id="activeEvents">0</div>
          <div class="stat-label">Active Events</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <div class="stat-value" id="totalTickets">0</div>
          <div class="stat-label">Total Tickets Sold</div>
        </div>
      </div>
      
      <div class="content-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="font-size: 22px; font-weight: 700; margin: 0;">Events Management</h2>
          <div style="display: flex; gap: 12px;">
            <button onclick="eventsManager.exportAll()" class="btn btn-secondary">
              <i class="fas fa-download"></i> Export All
            </button>
            <button onclick="eventsManager.openCreateModal()" class="btn btn-primary">
              <i class="fas fa-plus"></i> Create Event
            </button>
          </div>
        </div>
        
        <div id="eventsTable"></div>
      </div>
      
      <!-- Create/Edit Modal -->
      <div id="eventModal" class="modal">
        <div class="modal-content">
          <h3 id="modalTitle">Create Event</h3>
          <form id="eventForm">
            <div class="form-group">
              <label>Event Name *</label>
              <input type="text" name="name" required class="form-control">
            </div>
            <div class="form-group">
              <label>Date & Time *</label>
              <input type="datetime-local" name="date" required class="form-control">
            </div>
            <div class="form-group">
              <label>Location *</label>
              <input type="text" name="location" required class="form-control">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea name="description" rows="3" class="form-control"></textarea>
            </div>
            <div class="form-group">
              <label>Event Image</label>
              <div style="margin-bottom: 12px;">
                <button type="button" onclick="document.getElementById('eventImageFile').click()" class="btn btn-secondary" style="margin-right: 8px;">
                  <i class="fas fa-upload"></i> Upload Image
                </button>
                <span id="imageFileName" style="color: var(--gray-600); font-size: 14px;"></span>
                <input type="file" id="eventImageFile" accept="image/*" style="display: none;">
              </div>
              <div id="imagePreview" style="display: none; margin-bottom: 12px;">
                <img id="previewImg" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 2px solid var(--gray-200);">
              </div>
              <div style="margin-top: 8px;">
                <label style="font-size: 14px; color: var(--gray-600);">Or enter image URL:</label>
                <input type="url" name="image_url" id="imageUrlInput" class="form-control" placeholder="https://example.com/image.jpg">
              </div>
            </div>
            <div class="form-group">
              <label>Price (€) *</label>
              <input type="number" step="0.01" name="price" required class="form-control">
            </div>
            <div class="form-group">
              <label>Total Tickets *</label>
              <input type="number" name="total_tickets" required class="form-control">
            </div>
            <div class="form-group">
              <label>Minimum Age</label>
              <input type="number" name="min_age" class="form-control">
            </div>
            <div class="form-group">
              <label>Dress Code</label>
              <input type="text" name="dress_code" class="form-control">
            </div>
            <div class="form-group">
              <label>Status *</label>
              <select name="status" class="form-control" required>
                <option value="active">Active</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed (Visible)</option>
                <option value="completed_hidden">Completed (Hidden)</option>
              </select>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 24px;">
              <button type="button" onclick="eventsManager.closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Event</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    await this.loadEvents();
    this.setupEventForm();
  },
  
  async loadEvents() {
    try {
      showLoading();
      const response = await fetchAPI('/events');
      this.events = response;
      this.updateStats();
      this.renderTable();
    } catch (error) {
      showNotification('Failed to load events', 'error');
    } finally {
      hideLoading();
    }
  },
  
  updateStats() {
    const total = this.events.length;
    const active = this.events.filter(e => e.status === 'active').length;
    const totalTickets = this.events.reduce((sum, e) => sum + (e.sold_tickets || 0), 0);
    
    document.getElementById('totalEvents').textContent = total;
    document.getElementById('activeEvents').textContent = active;
    document.getElementById('totalTickets').textContent = totalTickets;
  },
  
  renderTable() {
    const tableHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Date</th>
            <th>Location</th>
            <th>Price</th>
            <th>Tickets</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.events.map(event => `
            <tr>
              <td><strong>${event.name}</strong></td>
              <td>${formatDate(event.date)}</td>
              <td>${event.location}</td>
              <td>€${event.price}</td>
              <td>${event.sold_tickets || 0} / ${event.total_tickets}</td>
              <td><span class="badge badge-${event.status}">${event.status}</span></td>
              <td>
                <div class="action-btns">
                  <button onclick="eventsManager.viewEvent('${event.id}')" class="btn btn-sm btn-secondary">View</button>
                  <button onclick="eventsManager.editEvent('${event.id}')" class="btn btn-sm btn-primary">Edit</button>
                  <button onclick="eventsManager.deleteEvent('${event.id}')" class="btn btn-sm btn-danger">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    document.getElementById('eventsTable').innerHTML = tableHTML;
  },
  
  openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Create Event';
    document.getElementById('eventForm').reset();
    document.getElementById('eventForm').dataset.id = '';
    document.getElementById('eventModal').classList.add('active');
  },
  
  closeModal() {
    document.getElementById('eventModal').classList.remove('active');
  },
  
  async editEvent(id) {
    const event = this.events.find(e => e.id === id);
    if (!event) return;
    
    const form = document.getElementById('eventForm');
    form.querySelector('[name="name"]').value = event.name;
    form.querySelector('[name="date"]').value = event.date.slice(0, 16);
    form.querySelector('[name="location"]').value = event.location;
    form.querySelector('[name="description"]').value = event.description || '';
    form.querySelector('[name="image_url"]').value = event.image_url || '';
    form.querySelector('[name="price"]').value = event.price;
    form.querySelector('[name="total_tickets"]').value = event.total_tickets;
    form.querySelector('[name="min_age"]').value = event.min_age || '';
    form.querySelector('[name="dress_code"]').value = event.dress_code || '';
    form.querySelector('[name="status"]').value = event.status;
    
    form.dataset.id = id;
    document.getElementById('modalTitle').textContent = 'Edit Event';
    document.getElementById('eventModal').classList.add('active');
  },
  
  setupEventForm() {
    const form = document.getElementById('eventForm');
    const fileInput = document.getElementById('eventImageFile');
    const imageFileName = document.getElementById('imageFileName');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const imageUrlInput = document.getElementById('imageUrlInput');
    
    // Handle file input change - show preview
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        imageFileName.textContent = file.name;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
        
        // Clear URL input if file is selected
        imageUrlInput.value = '';
      }
    });
    
    // Handle URL input - show preview
    imageUrlInput.addEventListener('input', (e) => {
      if (e.target.value) {
        previewImg.src = e.target.value;
        imagePreview.style.display = 'block';
        
        // Clear file input if URL is entered
        fileInput.value = '';
        imageFileName.textContent = '';
      }
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      let data = Object.fromEntries(formData.entries());
      const eventId = form.dataset.id;
      const imageFile = fileInput.files[0];
      
      try {
        showLoading();
        
        // Upload image if file is selected
        if (imageFile) {
          const uploadFormData = new FormData();
          uploadFormData.append('image', imageFile);
          
          const uploadResult = await fetchAPI('/upload/image', 'POST', uploadFormData, true);
          data.image_url = uploadResult.url;
        }
        
        if (eventId) {
          await fetchAPI(`/events/${eventId}`, 'PUT', data);
          showNotification('Event updated successfully', 'success');
        } else {
          await fetchAPI('/events', 'POST', data);
          showNotification('Event created successfully', 'success');
        }
        
        this.closeModal();
        await this.loadEvents();
      } catch (error) {
        showNotification(error.message || 'Failed to save event', 'error');
      } finally {
        hideLoading();
      }
    });
  },
  
  async deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event? This will also delete all associated bookings.')) {
      return;
    }
    
    try {
      showLoading();
      await fetchAPI(`/events/${id}`, 'DELETE');
      showNotification('Event deleted successfully', 'success');
      await this.loadEvents();
    } catch (error) {
      showNotification('Failed to delete event', 'error');
    } finally {
      hideLoading();
    }
  },
  
  async viewEvent(id) {
    const event = this.events.find(e => e.id === id);
    if (!event) return;
    alert(JSON.stringify(event, null, 2));
  },
  
  async exportAll() {
    try {
      showLoading();
      const response = await fetch(`${window.CONFIG.API_BASE_URL}/events/export/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'events-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showNotification('Events exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export events', 'error');
      console.error('Export error:', error);
    } finally {
      hideLoading();
    }
  }
};

// Bookings Manager
const bookingsManager = {
  bookings: [],
  
  async render(container) {
    container.innerHTML = `
      <div class="content-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="font-size: 22px; font-weight: 700; margin: 0;">Bookings Management</h2>
          <div style="display: flex; gap: 12px;">
            <button onclick="bookingsManager.exportParticipants()" class="btn btn-secondary">
              <i class="fas fa-download"></i> Export Participants
            </button>
            <button onclick="bookingsManager.openAddModal()" class="btn btn-primary">
              <i class="fas fa-plus"></i> Add Participant
            </button>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <input type="text" id="bookingSearch" placeholder="Search by name, email, phone, or ticket number..." class="form-control">
        </div>
        
        <div id="bookingsTable"></div>
      </div>
      
      <!-- Add Participant Modal -->
      <div id="addParticipantModal" class="modal">
        <div class="modal-content">
          <h3 id="modalTitle" style="margin-bottom: 24px;">Add Participant</h3>
          <form id="addParticipantForm">
            <div class="form-group">
              <label>Event *</label>
              <select name="event_id" id="participantEventSelect" required class="form-control">
                <option value="">Select an event</option>
              </select>
            </div>
            <div class="form-group">
              <label>First Name *</label>
              <input type="text" name="first_name" required class="form-control">
            </div>
            <div class="form-group">
              <label>Last Name *</label>
              <input type="text" name="last_name" required class="form-control">
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" name="email" required class="form-control">
            </div>
            <div class="form-group">
              <label>Phone *</label>
              <input type="tel" name="phone" required class="form-control">
            </div>
            <div class="form-group">
              <label>Quantity *</label>
              <input type="number" name="quantity" min="1" value="1" required class="form-control">
            </div>
            <div class="form-group">
              <label>Payment Status</label>
              <select name="payment_status" class="form-control">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 24px;">
              <button type="submit" class="btn btn-primary" style="flex: 1;">Add Participant</button>
              <button type="button" onclick="bookingsManager.closeAddModal()" class="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    await this.loadBookings();
    await this.loadEventsForSelect();
    this.setupSearch();
    this.setupAddParticipantForm();
  },
  
  async loadEventsForSelect() {
    try {
      const events = await fetchAPI('/events');
      const select = document.getElementById('participantEventSelect');
      if (select) {
        select.innerHTML = '<option value="">Select an event</option>' +
          events.filter(e => e.status === 'active' || e.status === 'coming-soon').map(event =>
            `<option value="${event.id}">${event.name} - ${formatDate(event.date)}</option>`
          ).join('');
      }
    } catch (error) {
      console.error('Failed to load events', error);
    }
  },
  
  setupAddParticipantForm() {
    const form = document.getElementById('addParticipantForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data.quantity = parseInt(data.quantity);
      
      try {
        showLoading();
        await fetchAPI('/bookings/manual', 'POST', data);
        showNotification('Participant added successfully', 'success');
        this.closeAddModal();
        await this.loadBookings();
      } catch (error) {
        showNotification(error.message || 'Failed to add participant', 'error');
      } finally {
        hideLoading();
      }
    });
  },
  
  async loadBookings() {
    try {
      showLoading();
      const response = await fetchAPI('/bookings');
      this.bookings = response;
      this.renderTable();
    } catch (error) {
      showNotification('Failed to load bookings', 'error');
    } finally {
      hideLoading();
    }
  },
  
  renderTable(filteredBookings = null) {
    const bookingsToShow = filteredBookings || this.bookings;
    
    const tableHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Ticket #</th>
            <th>Event</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Qty</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Booked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${bookingsToShow.map(booking => `
            <tr>
              <td><code>${booking.ticket_number}</code></td>
              <td>${booking.event_name || 'N/A'}</td>
              <td>${booking.first_name} ${booking.last_name}</td>
              <td>${booking.email}<br><small>${booking.phone}</small></td>
              <td>${booking.quantity}</td>
              <td>€${booking.total_amount}</td>
              <td><span class="badge badge-${booking.payment_status}">${booking.payment_status}</span></td>
              <td>${formatDate(booking.created_at)}</td>
              <td>
                <div class="action-btns">
                  ${booking.payment_status === 'pending' ? `
                    <button onclick="bookingsManager.confirmPayment('${booking.id}')" class="btn btn-sm btn-success">Confirm</button>
                  ` : ''}
                  <button onclick="bookingsManager.viewBooking('${booking.id}')" class="btn btn-sm btn-secondary">View</button>
                  <button onclick="bookingsManager.deleteBooking('${booking.id}')" class="btn btn-sm btn-danger">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    document.getElementById('bookingsTable').innerHTML = tableHTML;
  },
  
  setupSearch() {
    const searchInput = document.getElementById('bookingSearch');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = this.bookings.filter(b => 
        b.first_name.toLowerCase().includes(query) ||
        b.last_name.toLowerCase().includes(query) ||
        b.email.toLowerCase().includes(query) ||
        b.phone.toLowerCase().includes(query) ||
        b.ticket_number.toLowerCase().includes(query)
      );
      this.renderTable(filtered);
    });
  },
  
  async confirmPayment(id) {
    if (!confirm('Confirm payment for this booking?')) return;
    
    try {
      showLoading();
      await fetchAPI(`/bookings/${id}/confirm`, 'POST');
      showNotification('Payment confirmed and tickets sent', 'success');
      await this.loadBookings();
    } catch (error) {
      showNotification('Failed to confirm payment', 'error');
    } finally {
      hideLoading();
    }
  },
  
  async deleteBooking(id) {
    if (!confirm('Delete this booking?')) return;
    
    try {
      showLoading();
      await fetchAPI(`/bookings/${id}`, 'DELETE');
      showNotification('Booking deleted', 'success');
      await this.loadBookings();
    } catch (error) {
      showNotification('Failed to delete booking', 'error');
    } finally {
      hideLoading();
    }
  },
  
  async viewBooking(id) {
    const booking = this.bookings.find(b => b.id === id);
    if (booking) {
      const details = `
Booking Details:
================
Ticket: ${booking.ticket_number}
Name: ${booking.first_name} ${booking.last_name}
Email: ${booking.email}
Phone: ${booking.phone}
Quantity: ${booking.quantity}
Amount: €${booking.total_amount}
Status: ${booking.payment_status}
Created: ${formatDate(booking.created_at)}

Download ticket?`;
      
      if (confirm(details)) {
        await this.downloadTicket(id);
      }
    }
  },
  
  async downloadTicket(bookingId) {
    try {
      showLoading();
      
      const response = await fetch(`${window.CONFIG.API_BASE_URL}/bookings/${bookingId}/ticket`);
      
      if (!response.ok) {
        throw new Error('Failed to download ticket');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showNotification('Ticket downloaded successfully', 'success');
      
    } catch (error) {
      showNotification('Failed to download ticket', 'error');
      console.error('Error:', error);
    } finally {
      hideLoading();
    }
  },
  
  openAddModal() {
    document.getElementById('addParticipantForm').reset();
    document.getElementById('addParticipantModal').classList.add('active');
  },
  
  closeAddModal() {
    document.getElementById('addParticipantModal').classList.remove('active');
  },
  
  exportParticipants() {
    // Export all bookings as JSON
    if (this.bookings.length === 0) {
      showNotification('No bookings to export', 'info');
      return;
    }
    
    downloadJSON(this.bookings, `participants-export-${Date.now()}.json`);
    showNotification(`Exported ${this.bookings.length} bookings successfully`, 'success');
  }
};

// Workers Manager
const workersManager = {
  workers: [],
  events: [],
  
  async render(container) {
    container.innerHTML = `
      <div class="content-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="font-size: 22px; font-weight: 700; margin: 0;">Workers Management</h2>
          <div style="display: flex; gap: 12px;">
            <button onclick="workersManager.exportWorkers()" class="btn btn-secondary">
              <i class="fas fa-download"></i> Export Workers
            </button>
            <button onclick="workersManager.openAddModal()" class="btn btn-primary">
              <i class="fas fa-plus"></i> Add Worker
            </button>
          </div>
        </div>
        
        <div id="workersTable"></div>
      </div>
      
      <!-- Add/Edit Worker Modal -->
      <div id="workerModal" class="modal">
        <div class="modal-content">
          <h3 id="workerModalTitle">Add Worker</h3>
          <form id="workerForm">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" name="full_name" required class="form-control">
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" name="email" required class="form-control">
            </div>
            <div class="form-group">
              <label>Password *</label>
              <input type="password" name="password" required class="form-control">
            </div>
            <div class="form-group">
              <label>Role *</label>
              <select name="role" class="form-control" required>
                <option value="worker">Worker</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
            <div class="form-group">
              <label>Assigned Event</label>
              <select name="assigned_event_id" class="form-control" id="workerEventSelect">
                <option value="">None</option>
              </select>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 24px;">
              <button type="button" onclick="workersManager.closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Worker</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    await this.loadWorkers();
    await this.loadEvents();
    this.setupWorkerForm();
  },
  
  async loadWorkers() {
    try {
      showLoading();
      const response = await fetchAPI('/workers');
      this.workers = response;
      this.renderTable();
    } catch (error) {
      showNotification('Failed to load workers', 'error');
    } finally {
      hideLoading();
    }
  },
  
  async loadEvents() {
    try {
      const response = await fetchAPI('/events');
      this.events = response;
      this.populateEventSelect();
    } catch (error) {
      console.error('Failed to load events', error);
    }
  },
  
  populateEventSelect() {
    const select = document.getElementById('workerEventSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">None</option>' + 
      this.events.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
  },
  
  renderTable() {
    const tableHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Assigned Event</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.workers.map(worker => `
            <tr>
              <td><strong>${worker.full_name}</strong></td>
              <td>${worker.email}</td>
              <td><span class="badge badge-${worker.role}">${worker.role}</span></td>
              <td>${worker.assigned_event_name || 'Not assigned'}</td>
              <td>
                <div class="action-btns">
                  <button onclick="workersManager.editWorker('${worker.id}')" class="btn btn-sm btn-primary">Edit</button>
                  <button onclick="workersManager.deleteWorker('${worker.id}')" class="btn btn-sm btn-danger">Delete</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    document.getElementById('workersTable').innerHTML = tableHTML;
  },
  
  openAddModal() {
    document.getElementById('workerModalTitle').textContent = 'Add Worker';
    document.getElementById('workerForm').reset();
    document.getElementById('workerForm').dataset.id = '';
    document.getElementById('workerModal').classList.add('active');
  },
  
  closeModal() {
    document.getElementById('workerModal').classList.remove('active');
  },
  
  setupWorkerForm() {
    const form = document.getElementById('workerForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const workerId = form.dataset.id;
      
      try {
        showLoading();
        
        if (workerId) {
          await fetchAPI(`/workers/${workerId}`, 'PUT', data);
          showNotification('Worker updated', 'success');
        } else {
          await fetchAPI('/workers', 'POST', data);
          showNotification('Worker created', 'success');
        }
        
        this.closeModal();
        await this.loadWorkers();
      } catch (error) {
        showNotification(error.message || 'Failed to save worker', 'error');
      } finally {
        hideLoading();
      }
    });
  },
  
  async deleteWorker(id) {
    if (!confirm('Delete this worker?')) return;
    
    try {
      showLoading();
      await fetchAPI(`/workers/${id}`, 'DELETE');
      showNotification('Worker deleted', 'success');
      await this.loadWorkers();
    } catch (error) {
      showNotification('Failed to delete worker', 'error');
    } finally {
      hideLoading();
    }
  },
  
  editWorker(id) {
    const worker = this.workers.find(w => w.id === id);
    if (!worker) return;
    
    const form = document.getElementById('workerForm');
    form.querySelector('[name="full_name"]').value = worker.full_name;
    form.querySelector('[name="email"]').value = worker.email;
    form.querySelector('[name="password"]').value = '';
    form.querySelector('[name="role"]').value = worker.role;
    form.querySelector('[name="assigned_event_id"]').value = worker.assigned_event_id || '';
    
    form.dataset.id = id;
    document.getElementById('workerModalTitle').textContent = 'Edit Worker';
    document.getElementById('workerModal').classList.add('active');
  },
  
  async exportWorkers() {
    try {
      showLoading();
      const response = await fetch(`${window.CONFIG.API_BASE_URL}/workers/export/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'workers-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showNotification('Workers exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export workers', 'error');
      console.error('Export error:', error);
    } finally {
      hideLoading();
    }
  }
};

// Settings Manager
const settingsManager = {
  async render(container) {
    container.innerHTML = `
      <div class="content-section">
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 24px;">System Settings</h2>
        
        <div style="margin-bottom: 32px;">
          <h3>Payment Method</h3>
          <select id="paymentMethod" class="form-control" style="max-width: 300px;">
            <option value="stripe">Stripe</option>
            <option value="bank_transfer">Manual Bank Transfer</option>
          </select>
        </div>
        
        <div style="margin-bottom: 32px;">
          <h3>Bank Transfer Settings</h3>
          <div class="form-group">
            <label>Bank Recipient Name</label>
            <input type="text" id="bankRecipientName" class="form-control">
          </div>
          <div class="form-group">
            <label>IBAN</label>
            <input type="text" id="bankIBAN" class="form-control">
          </div>
          <button onclick="settingsManager.saveBankSettings()" class="btn btn-primary">Save Bank Settings</button>
        </div>
        
        <div style="margin-bottom: 32px;">
          <h3>Contacts</h3>
          <div class="form-group">
            <label>Support Email</label>
            <input type="email" id="supportEmail" class="form-control">
          </div>
          <div class="form-group">
            <label>Support Phone</label>
            <input type="tel" id="supportPhone" class="form-control">
          </div>
          <div class="form-group">
            <label>Working Hours</label>
            <input type="text" id="workingHours" class="form-control">
          </div>
          <button onclick="settingsManager.saveContactSettings()" class="btn btn-primary">Save Contact Settings</button>
        </div>
        
        <div style="margin-bottom: 32px;">
          <h3>Organization</h3>
          <div class="form-group">
            <label>Organization Name</label>
            <input type="text" id="orgName" class="form-control">
          </div>
          <div class="form-group">
            <label>Contact Email</label>
            <input type="email" id="orgEmail" class="form-control">
          </div>
          <div class="form-group">
            <label>Contact Phone</label>
            <input type="tel" id="orgPhone" class="form-control">
          </div>
          <button onclick="settingsManager.saveOrgSettings()" class="btn btn-primary">Save Organization Settings</button>
        </div>
        
        <div style="margin-bottom: 32px; border-top: 2px solid var(--gray-200); padding-top: 32px;">
          <h3>Policy & Rules Content</h3>
          <p style="color: var(--gray-600);">Edit the content of policies displayed on the public website.</p>
          
          <div class="form-group">
            <label>Terms of Service</label>
            <textarea id="policyTerms" class="form-control" rows="4" placeholder="Terms of Service content..."></textarea>
          </div>
          
          <div class="form-group">
            <label>Privacy Policy</label>
            <textarea id="policyPrivacy" class="form-control" rows="4" placeholder="Privacy Policy content..."></textarea>
          </div>
          
          <div class="form-group">
            <label>Event Guidelines</label>
            <textarea id="policyGuidelines" class="form-control" rows="4" placeholder="Event Guidelines content..."></textarea>
          </div>
          
          <div class="form-group">
            <label>Refund Policy</label>
            <textarea id="policyRefund" class="form-control" rows="4" placeholder="Refund Policy content..."></textarea>
          </div>
          
          <div class="form-group">
            <label>Code of Conduct</label>
            <textarea id="policyConduct" class="form-control" rows="4" placeholder="Code of Conduct content..."></textarea>
          </div>
          
          <button onclick="settingsManager.savePolicies()" class="btn btn-primary">Save All Policies</button>
        </div>
        
        <div style="margin-bottom: 32px; border-top: 2px solid var(--gray-200); padding-top: 32px;">
          <h3 style="color: var(--gray-700);">Data Management</h3>
          <p style="color: var(--gray-600);">Download a complete backup of all system data or reset everything to start fresh.</p>
          <div style="display: flex; gap: 12px; margin-top: 16px;">
            <button onclick="settingsManager.downloadBackup()" class="btn btn-secondary">
              <i class="fas fa-download"></i> Download Backup
            </button>
            <button onclick="settingsManager.resetSystem()" class="btn btn-danger">
              <i class="fas fa-exclamation-triangle"></i> Reset Everything
            </button>
          </div>
        </div>
      </div>
    `;
    
    await this.loadSettings();
    await this.loadPolicies();
  },
  
  async loadSettings() {
    try {
      const settings = await fetchAPI('/settings');
      // Populate form fields
      settings.forEach(setting => {
        const field = document.getElementById(setting.key);
        if (field) field.value = setting.value;
      });
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  },
  
  async saveBankSettings() {
    const data = {
      bankRecipientName: document.getElementById('bankRecipientName').value,
      bankIBAN: document.getElementById('bankIBAN').value
    };
    
    try {
      await fetchAPI('/settings', 'PUT', data);
      showNotification('Bank settings saved', 'success');
    } catch (error) {
      showNotification('Failed to save settings', 'error');
    }
  },
  
  async saveContactSettings() {
    const data = {
      supportEmail: document.getElementById('supportEmail').value,
      supportPhone: document.getElementById('supportPhone').value,
      workingHours: document.getElementById('workingHours').value
    };
    
    try {
      await fetchAPI('/settings', 'PUT', data);
      showNotification('Contact settings saved', 'success');
    } catch (error) {
      showNotification('Failed to save settings', 'error');
    }
  },
  
  async saveOrgSettings() {
    const data = {
      orgName: document.getElementById('orgName').value,
      orgEmail: document.getElementById('orgEmail').value,
      orgPhone: document.getElementById('orgPhone').value
    };
    
    try {
      await fetchAPI('/settings', 'PUT', data);
      showNotification('Organization settings saved', 'success');
    } catch (error) {
      showNotification('Failed to save settings', 'error');
    }
  },
  
  async loadPolicies() {
    try {
      const policies = await fetchAPI('/policies');
      
      // Map policy types to field IDs
      const policyMap = {
        'terms': 'policyTerms',
        'privacy': 'policyPrivacy',
        'guidelines': 'policyGuidelines',
        'refund': 'policyRefund',
        'conduct': 'policyConduct'
      };
      
      policies.forEach(policy => {
        const fieldId = policyMap[policy.type];
        const field = document.getElementById(fieldId);
        if (field) {
          field.value = policy.content || '';
        }
      });
    } catch (error) {
      console.error('Failed to load policies', error);
    }
  },
  
  async savePolicies() {
    const policies = [
      { type: 'terms', title: 'Terms of Service', content: document.getElementById('policyTerms').value },
      { type: 'privacy', title: 'Privacy Policy', content: document.getElementById('policyPrivacy').value },
      { type: 'guidelines', title: 'Event Guidelines', content: document.getElementById('policyGuidelines').value },
      { type: 'refund', title: 'Refund Policy', content: document.getElementById('policyRefund').value },
      { type: 'conduct', title: 'Code of Conduct', content: document.getElementById('policyConduct').value }
    ];
    
    try {
      showLoading();
      
      for (const policy of policies) {
        await fetchAPI(`/policies/${policy.type}`, 'PUT', policy);
      }
      
      showNotification('Policies saved successfully', 'success');
    } catch (error) {
      showNotification('Failed to save policies', 'error');
      console.error('Save policies error:', error);
    } finally {
      hideLoading();
    }
  },
  
  async downloadBackup() {
    try {
      showLoading();
      const response = await fetch(`${window.CONFIG.API_BASE_URL}/settings/backup`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Backup failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showNotification('Backup downloaded successfully', 'success');
    } catch (error) {
      showNotification('Failed to download backup', 'error');
      console.error('Backup error:', error);
    } finally {
      hideLoading();
    }
  },
  
  async resetSystem() {
    if (!confirm('Are you ABSOLUTELY sure? This will delete ALL data!')) return;
    if (!confirm('Last warning: This action cannot be undone!')) return;
    
    try {
      showLoading();
      
      // First download backup
      await this.downloadBackup();
      
      // Then reset
      await fetchAPI('/settings/reset', 'POST');
      showNotification('System reset complete. Backup downloaded.', 'success');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      showNotification('Failed to reset system', 'error');
      console.error('Reset error:', error);
    } finally {
      hideLoading();
    }
  }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  dashboard.init();
});

