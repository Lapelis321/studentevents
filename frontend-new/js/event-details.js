// =====================================================
// EVENT DETAILS PAGE
// =====================================================

class EventDetailsPage {
  constructor() {
    this.event = null;
    this.eventId = null;
    this.init();
  }
  
  async init() {
    this.eventId = new URLSearchParams(window.location.search).get('id');
    
    if (!this.eventId) {
      window.location.href = '/';
      return;
    }
    
    await this.loadEvent();
    this.renderEvent();
  }
  
  async loadEvent() {
    const container = document.getElementById('eventDetailsContainer');
    Utils.showLoading(container);
    
    try {
      this.event = await Utils.apiRequest(`/events/${this.eventId}`);
      console.log('✅ Event loaded:', this.event.name);
      
    } catch (error) {
      console.error('Error loading event:', error);
      Utils.showError(container, 'Failed to load event details. Please try again later.');
    }
  }
  
  renderEvent() {
    const container = document.getElementById('eventDetailsContainer');
    
    if (!this.event) return;
    
    const availableTickets = this.event.total_tickets - (this.event.sold_tickets || 0);
    const isAvailable = this.event.status === 'active' && availableTickets > 0;
    
    container.innerHTML = `
      ${this.event.image_url ? `
        <img src="${this.event.image_url}" alt="${this.event.name}" class="event-image-large">
      ` : `
        <div class="event-image-large">
          <i class="fas fa-calendar-star"></i>
        </div>
      `}
      
      <div class="event-content">
        <h1 class="event-title-large">${this.event.name}</h1>
        
        ${this.getStatusBadge()}
        
        <div class="event-meta-large">
          <div class="meta-item">
            <div class="meta-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="meta-content">
              <h4>Date & Time</h4>
              <p>${Utils.formatDate(this.event.date)}</p>
            </div>
          </div>
          
          <div class="meta-item">
            <div class="meta-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="meta-content">
              <h4>Location</h4>
              <p>${this.event.location}</p>
            </div>
          </div>
          
          <div class="meta-item">
            <div class="meta-icon">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <div class="meta-content">
              <h4>Available Tickets</h4>
              <p>${availableTickets} / ${this.event.total_tickets}</p>
            </div>
          </div>
          
          ${this.event.min_age ? `
            <div class="meta-item">
              <div class="meta-icon">
                <i class="fas fa-user-check"></i>
              </div>
              <div class="meta-content">
                <h4>Age Restriction</h4>
                <p>${this.event.min_age}+ years</p>
              </div>
            </div>
          ` : ''}
          
          ${this.event.dress_code ? `
            <div class="meta-item">
              <div class="meta-icon">
                <i class="fas fa-tshirt"></i>
              </div>
              <div class="meta-content">
                <h4>Dress Code</h4>
                <p>${this.event.dress_code}</p>
              </div>
            </div>
          ` : ''}
        </div>
        
        ${this.event.description ? `
          <div class="event-description">
            <h3>About This Event</h3>
            <p>${this.event.description}</p>
          </div>
        ` : ''}
        
        <div class="booking-section">
          <div class="booking-info">
            <div class="booking-price">€${parseFloat(this.event.price).toFixed(2)}</div>
            <div class="booking-availability">
              ${isAvailable 
                ? `${availableTickets} tickets available` 
                : 'Tickets unavailable'
              }
            </div>
          </div>
          
          ${isAvailable ? `
            <button class="btn btn-primary btn-large" onclick="eventDetailsPage.bookTickets()">
              <i class="fas fa-shopping-cart"></i>
              Book Tickets
            </button>
          ` : `
            <button class="btn btn-secondary btn-large" disabled>
              ${this.event.status === 'sold-out' || availableTickets === 0 
                ? 'Sold Out' 
                : 'Unavailable'
              }
            </button>
          `}
        </div>
      </div>
    `;
  }
  
  getStatusBadge() {
    switch (this.event.status) {
      case 'active':
        return '';
      case 'coming-soon':
        return '<span class="badge badge-info" style="font-size: 14px; margin-bottom: 20px;">Coming Soon</span>';
      case 'cancelled':
        return '<span class="badge badge-error" style="font-size: 14px; margin-bottom: 20px;">Cancelled</span>';
      case 'completed-visible':
        return '<span class="badge badge-warning" style="font-size: 14px; margin-bottom: 20px;">Event Completed</span>';
      default:
        return '';
    }
  }
  
  bookTickets() {
    // Store event in session storage for booking page
    sessionStorage.setItem('selectedEvent', JSON.stringify(this.event));
    window.location.href = 'booking.html';
  }
}

// Initialize
let eventDetailsPage;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    eventDetailsPage = new EventDetailsPage();
  });
} else {
  eventDetailsPage = new EventDetailsPage();
}

