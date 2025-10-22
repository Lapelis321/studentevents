// =====================================================
// HOMEPAGE JAVASCRIPT
// =====================================================

class HomePage {
  constructor() {
    this.events = [];
    this.init();
  }
  
  async init() {
    await this.loadEvents();
    this.renderEvents();
  }
  
  async loadEvents() {
    const container = document.getElementById('eventsGrid');
    Utils.showLoading(container);
    
    try {
      this.events = await Utils.apiRequest('/events');
      
      // Filter out completed-hidden events
      this.events = this.events.filter(event => {
        return event.status !== 'completed-hidden';
      });
      
      // Sort by date
      this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      console.log(`✅ Loaded ${this.events.length} events`);
      
    } catch (error) {
      console.error('Error loading events:', error);
      Utils.showError(container, 'Failed to load events. Please try again later.');
    }
  }
  
  renderEvents() {
    const container = document.getElementById('eventsGrid');
    
    if (this.events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-calendar-times"></i>
          <h3>No Events Available</h3>
          <p>Check back soon for upcoming events!</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.events.map(event => this.renderEventCard(event)).join('');
    
    // Add click listeners
    document.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => {
        const eventId = card.dataset.eventId;
        window.location.href = `event-details.html?id=${eventId}`;
      });
    });
  }
  
  renderEventCard(event) {
    const statusBadge = this.getStatusBadge(event);
    const availableTickets = event.total_tickets - (event.sold_tickets || 0);
    
    return `
      <div class="event-card" data-event-id="${event.id}">
        <div class="event-image">
          ${event.image_url 
            ? `<img src="${event.image_url}" alt="${event.name}" style="width: 100%; height: 100%; object-fit: cover;">`
            : '<i class="fas fa-calendar-star"></i>'
          }
        </div>
        <div class="event-content">
          <h3 class="event-title">${event.name}</h3>
          
          <div class="event-meta">
            <div class="event-meta-item">
              <i class="fas fa-calendar-alt"></i>
              <span>${Utils.formatDate(event.date, { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit'
              })}</span>
            </div>
            
            <div class="event-meta-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>${event.location}</span>
            </div>
            
            ${event.min_age ? `
              <div class="event-meta-item">
                <i class="fas fa-user-check"></i>
                <span>${event.min_age}+ years</span>
              </div>
            ` : ''}
            
            <div class="event-meta-item">
              <i class="fas fa-ticket-alt"></i>
              <span>${availableTickets} tickets available</span>
            </div>
          </div>
          
          <div class="event-footer">
            <div class="event-price">
              €${parseFloat(event.price).toFixed(2)}
            </div>
            <div class="event-status">
              ${statusBadge}
              <i class="fas fa-arrow-right" style="color: var(--primary-600);"></i>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  getStatusBadge(event) {
    switch (event.status) {
      case 'active':
        return '<span class="badge badge-success">Active</span>';
      case 'coming-soon':
        return '<span class="badge badge-info">Coming Soon</span>';
      case 'cancelled':
        return '<span class="badge badge-error">Cancelled</span>';
      case 'completed-visible':
        return '<span class="badge badge-warning">Completed</span>';
      default:
        return '';
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
  });
} else {
  new HomePage();
}


