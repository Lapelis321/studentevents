// =====================================================
// BOOKING PAGE
// =====================================================

class BookingPage {
  constructor() {
    this.event = null;
    this.quantity = 1;
    this.maxQuantity = 10;
    this.init();
  }
  
  async init() {
    // Load event from session storage
    const eventData = sessionStorage.getItem('selectedEvent');
    
    if (!eventData) {
      Utils.showNotification('No event selected', 'error');
      setTimeout(() => window.location.href = '/', 1500);
      return;
    }
    
    this.event = JSON.parse(eventData);
    this.maxQuantity = Math.min(10, this.event.total_tickets - (this.event.sold_tickets || 0));
    
    this.renderEventSummary();
    this.renderPriceBreakdown();
    this.setupFormListeners();
  }
  
  renderEventSummary() {
    const container = document.getElementById('eventSummary');
    
    container.innerHTML = `
      <h3>${this.event.name}</h3>
      <p><i class="fas fa-calendar-alt"></i> ${Utils.formatDate(this.event.date, { 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      <p><i class="fas fa-map-marker-alt"></i> ${this.event.location}</p>
      <p><i class="fas fa-ticket-alt"></i> €${parseFloat(this.event.price).toFixed(2)} per ticket</p>
    `;
  }
  
  renderPriceBreakdown() {
    const container = document.getElementById('priceBreakdown');
    const subtotal = this.event.price * this.quantity;
    
    container.innerHTML = `
      <div class="price-row">
        <span>Ticket Price</span>
        <span>€${parseFloat(this.event.price).toFixed(2)}</span>
      </div>
      <div class="price-row">
        <span>Quantity</span>
        <span>×${this.quantity}</span>
      </div>
      <div class="price-row total">
        <span>Total</span>
        <span>€${subtotal.toFixed(2)}</span>
      </div>
    `;
  }
  
  increaseQuantity() {
    if (this.quantity < this.maxQuantity) {
      this.quantity++;
      this.updateQuantityDisplay();
      this.renderPriceBreakdown();
      this.renderAdditionalAttendees();
    }
  }
  
  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
      this.updateQuantityDisplay();
      this.renderPriceBreakdown();
      this.renderAdditionalAttendees();
    }
  }
  
  updateQuantityDisplay() {
    document.getElementById('quantityDisplay').textContent = this.quantity;
  }
  
  renderAdditionalAttendees() {
    const container = document.getElementById('additionalAttendeesContainer');
    const additionalCount = this.quantity - 1;
    
    if (additionalCount === 0) {
      container.innerHTML = '';
      return;
    }
    
    const attendeeForms = [];
    for (let i = 0; i < additionalCount; i++) {
      attendeeForms.push(`
        <div class="attendee-section">
          <h3><i class="fas fa-user-plus"></i> Additional Attendee ${i + 1}</h3>
          <div class="attendee-card">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input type="text" class="form-input" id="attendee${i}_firstName" required>
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input type="text" class="form-input" id="attendee${i}_lastName" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email (Optional)</label>
                <input type="email" class="form-input" id="attendee${i}_email">
                <small style="color: var(--gray-500); font-size: 13px;">Tickets will be sent to primary contact</small>
              </div>
              <div class="form-group">
                <label class="form-label">Phone (Optional)</label>
                <input type="tel" class="form-input" id="attendee${i}_phone">
              </div>
            </div>
          </div>
        </div>
      `);
    }
    
    container.innerHTML = attendeeForms.join('');
  }
  
  setupFormListeners() {
    const form = document.getElementById('bookingForm');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }
  
  validateForm() {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    
    // Validate primary contact
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!firstName) {
      document.getElementById('firstName-error').textContent = 'First name is required';
      isValid = false;
    }
    
    if (!lastName) {
      document.getElementById('lastName-error').textContent = 'Last name is required';
      isValid = false;
    }
    
    if (!email) {
      document.getElementById('email-error').textContent = 'Email is required';
      isValid = false;
    } else if (!Utils.validateEmail(email)) {
      document.getElementById('email-error').textContent = 'Invalid email address';
      isValid = false;
    }
    
    if (!phone) {
      document.getElementById('phone-error').textContent = 'Phone number is required';
      isValid = false;
    } else if (!Utils.validatePhone(phone)) {
      document.getElementById('phone-error').textContent = 'Invalid phone number';
      isValid = false;
    }
    
    // Validate terms
    const termsCheckbox = document.getElementById('termsCheckbox');
    if (!termsCheckbox.checked) {
      document.getElementById('terms-error').textContent = 'You must agree to the terms';
      isValid = false;
    }
    
    // Validate additional attendees
    for (let i = 0; i < this.quantity - 1; i++) {
      const attendeeFirstName = document.getElementById(`attendee${i}_firstName`);
      const attendeeLastName = document.getElementById(`attendee${i}_lastName`);
      
      if (attendeeFirstName && !attendeeFirstName.value.trim()) {
        isValid = false;
      }
      
      if (attendeeLastName && !attendeeLastName.value.trim()) {
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  async handleSubmit() {
    if (!this.validateForm()) {
      Utils.showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
      // Gather form data
      const formData = {
        event_id: this.event.id,
        first_name: document.getElementById('firstName').value.trim(),
        last_name: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        quantity: this.quantity,
        payment_method: 'bank-transfer',
        additional_attendees: []
      };
      
      // Gather additional attendees
      for (let i = 0; i < this.quantity - 1; i++) {
        const attendeeData = {
          firstName: document.getElementById(`attendee${i}_firstName`).value.trim(),
          lastName: document.getElementById(`attendee${i}_lastName`).value.trim(),
          email: document.getElementById(`attendee${i}_email`)?.value.trim() || '',
          phone: document.getElementById(`attendee${i}_phone`)?.value.trim() || ''
        };
        formData.additional_attendees.push(attendeeData);
      }
      
      // Create booking
      const response = await Utils.apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      console.log('✅ Booking created:', response);
      
      // Get bank details
      const bankDetails = await Utils.apiRequest('/payments/bank-details');
      
      // Store booking info for payment page
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        booking: response.booking,
        event: this.event,
        bankDetails
      }));
      
      // Redirect to payment instructions
      window.location.href = 'payment-instructions.html';
      
    } catch (error) {
      console.error('Error creating booking:', error);
      Utils.showNotification('Failed to create booking. Please try again.', 'error');
      
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Continue to Payment';
    }
  }
}

// Initialize
let bookingPage;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bookingPage = new BookingPage();
  });
} else {
  bookingPage = new BookingPage();
}

