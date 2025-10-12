// ===== EVENT DETAILS PAGE JAVASCRIPT =====

class EventDetails {
    constructor() {
        this.event = null;
        this.init();
    }

    init() {
        this.loadEventData();
    }

    loadEventData() {
        // Always try to fetch fresh data from API first
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('id');
        
        if (eventId) {
            this.fetchEventById(eventId);
        } else {
            // Fallback to sessionStorage if no ID in URL
            const storedEvent = sessionStorage.getItem('selectedEvent');
            
            if (storedEvent) {
                this.event = JSON.parse(storedEvent);
                this.renderEventDetails();
            } else {
                this.showErrorState('Event not found');
            }
        }
    }

    async fetchEventById(eventId) {
        try {
            // Try to fetch from API first
            const response = await fetch(`${CONFIG.API_BASE_URL}/events/${eventId}`);
            if (response.ok) {
                this.event = await response.json();
                this.renderEventDetails();
            } else {
                // Fallback to mock data
                const mockEvents = this.getMockEvents();
                this.event = mockEvents.find(e => e.id == eventId);
                
                if (this.event) {
                    this.renderEventDetails();
                } else {
                    this.showErrorState('Event not found');
                }
            }
        } catch (error) {
            console.error('Error fetching event:', error);
            // Fallback to mock data
            const mockEvents = this.getMockEvents();
            this.event = mockEvents.find(e => e.id == eventId);
            
            if (this.event) {
                this.renderEventDetails();
            } else {
                this.showErrorState('Failed to load event details');
            }
        }
    }

    getMockEvents() {
        return [
            {
                id: 1,
                title: "Spring Music Festival",
                date: "2024-04-15T19:00:00Z",
                location: "University Campus",
                price: 25.00,
                currency: "EUR",
                minAge: 18,
                dressCode: "Casual",
                description: "Join us for an amazing night of live music featuring local and international artists.",
                additionalInfo: "Food trucks will be available on-site. Bring your student ID for verification. The event will feature multiple stages with different genres of music including rock, pop, electronic, and indie. VIP packages include backstage access and meet-and-greet opportunities with select artists.",
                availableTickets: 150,
                totalTickets: 500
            },
            {
                id: 2,
                title: "Tech Innovation Summit",
                date: "2024-04-22T14:00:00Z",
                location: "Convention Center",
                price: 15.00,
                currency: "EUR",
                minAge: 16,
                dressCode: "Business Casual",
                description: "Explore the latest in technology and innovation with industry leaders.",
                additionalInfo: "Networking lunch included. Laptops recommended for workshops. The summit will cover topics including AI, blockchain, cybersecurity, and sustainable technology. Attendees will receive certificates of participation and access to exclusive networking sessions.",
                availableTickets: 200,
                totalTickets: 300
            },
            {
                id: 3,
                title: "Art & Culture Night",
                date: "2024-04-28T18:30:00Z",
                location: "City Art Gallery",
                price: 12.00,
                currency: "EUR",
                minAge: 16,
                dressCode: "Smart Casual",
                description: "An evening celebrating local artists and cultural diversity.",
                additionalInfo: "Wine and cheese reception included. Photography allowed. The event showcases works from emerging local artists, interactive installations, and live performances. Guests can participate in mini-workshops and meet the artists.",
                availableTickets: 80,
                totalTickets: 100
            },
            {
                id: 4,
                title: "Sports Championship Finals",
                date: "2024-05-05T16:00:00Z",
                location: "Stadium Arena",
                price: 30.00,
                currency: "EUR",
                minAge: 12,
                dressCode: "Casual",
                description: "Cheer for your favorite teams in the ultimate championship showdown.",
                additionalInfo: "Stadium food and beverages available. Team merchandise on sale. The championship features the top 4 teams competing in semi-finals and finals. Halftime entertainment includes performances by the university marching band and cheerleading squads.",
                availableTickets: 500,
                totalTickets: 1000
            },
            {
                id: 5,
                title: "Comedy Night Special",
                date: "2024-05-12T20:00:00Z",
                location: "Student Union Hall",
                price: 18.00,
                currency: "EUR",
                minAge: 18,
                dressCode: "Casual",
                description: "Laugh the night away with top comedians and rising stars.",
                additionalInfo: "Two-drink minimum. Late seating not permitted after show starts. The lineup includes both established comedians and up-and-coming local talent. The show runs for approximately 2.5 hours with a 15-minute intermission.",
                availableTickets: 120,
                totalTickets: 150
            },
            {
                id: 6,
                title: "Environmental Awareness Workshop",
                date: "2024-05-18T10:00:00Z",
                location: "Science Building",
                price: 8.00,
                currency: "EUR",
                minAge: 14,
                dressCode: "Casual",
                description: "Learn about sustainability and environmental protection.",
                additionalInfo: "Materials provided. Certificate of participation available. The workshop covers practical sustainability tips, climate change awareness, and hands-on activities. Participants will learn about renewable energy, waste reduction, and sustainable living practices.",
                availableTickets: 60,
                totalTickets: 80
            }
        ];
    }

    renderEventDetails() {
        const container = document.getElementById('eventDetails');
        if (!container || !this.event) return;

        const formattedDate = this.formatEventDate(this.event.date);
        const formattedPrice = EventTicketingApp.formatPrice(this.event.price, this.event.currency);
        const availabilityStatus = this.getAvailabilityStatus();

        // Determine if button should be disabled
        const isCompleted = this.event.status === 'completed' || this.event.status === 'completed-shown';
        const isSoldOut = this.event.availableTickets === 0 || this.event.availableTickets === '0' || this.event.status === 'sold-out';
        const isCancelled = this.event.status === 'cancelled';
        const isComingSoon = this.event.status === 'coming-soon';
        const isButtonDisabled = isCompleted || isSoldOut || isCancelled || isComingSoon;

        // Determine button text and icon
        let buttonText = 'Buy Ticket';
        let buttonIcon = 'fa-ticket-alt';
        
        if (isCompleted) {
            buttonText = 'Event Completed';
            buttonIcon = 'fa-check-circle';
        } else if (isCancelled) {
            buttonText = 'Event Cancelled';
            buttonIcon = 'fa-times-circle';
        } else if (isComingSoon) {
            buttonText = 'Tickets Available Soon';
            buttonIcon = 'fa-clock';
        } else if (isSoldOut) {
            buttonText = 'Sold Out';
            buttonIcon = 'fa-ban';
        }

        container.innerHTML = `
            <div class="event-header">
                <div class="event-image">
                    <i class="fas fa-calendar-star"></i>
                </div>
                <h1 class="event-title">${this.event.title}</h1>
                <p class="event-subtitle">${this.event.description}</p>
            </div>

            <div class="event-info">
                <div class="event-details-section">
                    <h2>
                        <i class="fas fa-info-circle"></i>
                        Event Details
                    </h2>
                    
                    <div class="event-meta-grid">
                        <div class="event-meta-item">
                            <i class="fas fa-calendar-alt"></i>
                            <div class="event-meta-content">
                                <div class="event-meta-label">Date & Time</div>
                                <div class="event-meta-value">${formattedDate}</div>
                            </div>
                        </div>
                        
                        <div class="event-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div class="event-meta-content">
                                <div class="event-meta-label">Location</div>
                                <div class="event-meta-value">${this.event.location}</div>
                            </div>
                        </div>
                        
                        <div class="event-meta-item">
                            <i class="fas fa-users"></i>
                            <div class="event-meta-content">
                                <div class="event-meta-label">Minimum Age</div>
                                <div class="event-meta-value">${this.event.minAge}+ years</div>
                            </div>
                        </div>
                        
                        <div class="event-meta-item">
                            <i class="fas fa-tshirt"></i>
                            <div class="event-meta-content">
                                <div class="event-meta-label">Dress Code</div>
                                <div class="event-meta-value">${this.event.dressCode}</div>
                            </div>
                        </div>
                    </div>

                    ${this.event.additionalInfo ? this.renderAdditionalInfo() : ''}
                </div>

                <div class="booking-section">
                    <h2>Book Your Ticket</h2>
                    
                    <div class="price-display">
                        <span class="price-amount">${formattedPrice}</span>
                        <div class="price-label">per ticket</div>
                    </div>

                    <div class="availability-status ${availabilityStatus.class}">
                        <i class="fas fa-${availabilityStatus.icon}"></i>
                        <span>${availabilityStatus.text}</span>
                    </div>

                    <button class="buy-ticket-btn" 
                            onclick="eventDetails.proceedToCheckout()" 
                            ${isButtonDisabled ? 'disabled' : ''}>
                        <i class="fas ${buttonIcon}"></i>
                        ${buttonText}
                    </button>

                    <div class="booking-info">
                        <div class="booking-info-item">
                            <i class="fas fa-shield-alt"></i>
                            <span>Secure payment processing</span>
                        </div>
                        <div class="booking-info-item">
                            <i class="fas fa-mobile-alt"></i>
                            <span>Mobile tickets available</span>
                        </div>
                        <div class="booking-info-item">
                            <i class="fas fa-undo"></i>
                            <span>Free cancellation up to 24h before</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupExpandableContent();
    }

    renderAdditionalInfo() {
        const isLong = this.event.additionalInfo.length > 200;
        
        return `
            <div class="additional-info">
                <h3>
                    <i class="fas fa-exclamation-circle"></i>
                    Important Information
                </h3>
                <div class="additional-info-content">
                    <div class="additional-info-text ${isLong ? 'expandable-content' : ''}" id="additionalInfoText">
                        ${this.event.additionalInfo}
                    </div>
                    ${isLong ? `
                        <button class="expand-toggle" onclick="eventDetails.toggleExpandableContent()">
                            <span class="expand-text">Read more</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    setupExpandableContent() {
        const expandableContent = document.querySelector('.expandable-content');
        if (expandableContent) {
            // Set initial max-height based on content
            const scrollHeight = expandableContent.scrollHeight;
            if (scrollHeight > 100) {
                expandableContent.style.maxHeight = '100px';
            }
        }
    }

    toggleExpandableContent() {
        const content = document.getElementById('additionalInfoText');
        const toggle = document.querySelector('.expand-toggle');
        const expandText = toggle.querySelector('.expand-text');
        const icon = toggle.querySelector('i');

        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            content.style.maxHeight = '100px';
            expandText.textContent = 'Read more';
            icon.style.transform = 'rotate(0deg)';
            toggle.classList.remove('expanded');
        } else {
            content.classList.add('expanded');
            content.style.maxHeight = content.scrollHeight + 'px';
            expandText.textContent = 'Read less';
            icon.style.transform = 'rotate(180deg)';
            toggle.classList.add('expanded');
        }
    }

    getAvailabilityStatus() {
        const available = this.event.availableTickets;
        const total = this.event.totalTickets || 500;
        const percentage = (available / total) * 100;

        // Check for completed status
        if (this.event.status === 'completed' || this.event.status === 'completed-shown') {
            return {
                class: 'completed',
                icon: 'check-circle',
                text: 'Event Completed'
            };
        }

        // Check for cancelled status
        if (this.event.status === 'cancelled') {
            return {
                class: 'cancelled',
                icon: 'times-circle',
                text: 'Event Cancelled'
            };
        }

        // Check for sold out
        if (available === 0 || available === '0' || this.event.status === 'sold-out') {
            return {
                class: 'sold-out',
                icon: 'ban',
                text: 'Sold Out'
            };
        } else if (percentage <= 20) {
            return {
                class: 'limited',
                icon: 'exclamation-triangle',
                text: `Only ${available} tickets left!`
            };
        } else {
            return {
                class: 'available',
                icon: 'check-circle',
                text: `${available} tickets available`
            };
        }
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

    proceedToCheckout() {
        // Check if event is completed
        if (this.event.status === 'completed' || this.event.status === 'completed-shown') {
            EventTicketingApp.showNotification('This event has already ended', 'error');
            return;
        }

        // Check if event is cancelled
        if (this.event.status === 'cancelled') {
            EventTicketingApp.showNotification('This event has been cancelled', 'error');
            return;
        }

        // Check if event is sold out
        if (this.event.availableTickets === 0 || this.event.availableTickets === '0' || this.event.status === 'sold-out') {
            EventTicketingApp.showNotification('This event is sold out', 'error');
            return;
        }

        // Store event data for checkout page
        sessionStorage.setItem('checkoutEvent', JSON.stringify(this.event));
        window.location.href = 'checkout.html';
    }

    showErrorState(message) {
        const container = document.getElementById('eventDetails');
        if (!container) return;

        container.innerHTML = `
            <div class="event-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Oops! Something went wrong</h2>
                <p>${message}</p>
                <a href="index.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Back to Events
                </a>
            </div>
        `;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize event details page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.eventDetails = new EventDetails();
});
