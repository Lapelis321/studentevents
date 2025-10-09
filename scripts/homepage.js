// ===== HOMEPAGE SPECIFIC JAVASCRIPT =====

class Homepage {
    constructor() {
        this.events = [];
        this.isLoading = false;
        this.init();
    }

    init() {
        this.loadEvents();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Refresh events when page becomes visible (for mobile app-like behavior)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('📱 Page became visible, refreshing events...');
                this.loadEvents();
            }
        });
        
        // Auto-refresh events every 30 seconds to catch new events from admin
        setInterval(() => {
            console.log('🔄 Auto-refreshing events...');
            this.loadEvents();
        }, 30000);
    }

    async loadEvents() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();

        try {
            // Try to load from API first
            const response = await fetch(`${CONFIG.API_BASE_URL}/events`);
            if (response.ok) {
                this.events = await response.json();
            } else {
                // Fallback to mock data
                this.events = this.getMockEvents();
            }
            this.renderEvents();
        } catch (error) {
            console.error('Error loading events:', error);
            // Fallback to mock data
            this.events = this.getMockEvents();
            this.renderEvents();
        } finally {
            this.isLoading = false;
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
                additionalInfo: "Food trucks will be available on-site. Bring your student ID for verification.",
                availableTickets: 150
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
                additionalInfo: "Networking lunch included. Laptops recommended for workshops.",
                availableTickets: 200
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
                additionalInfo: "Wine and cheese reception included. Photography allowed.",
                availableTickets: 80
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
                additionalInfo: "Stadium food and beverages available. Team merchandise on sale.",
                availableTickets: 500
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
                additionalInfo: "Two-drink minimum. Late seating not permitted after show starts.",
                availableTickets: 120
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
                additionalInfo: "Materials provided. Certificate of participation available.",
                availableTickets: 60
            }
        ];
    }

    showLoadingState() {
        const eventsGrid = document.getElementById('eventsGrid');
        if (!eventsGrid) return;

        eventsGrid.innerHTML = `
            <div class="events-loading">
                <div class="spinner"></div>
                <p>Loading amazing events...</p>
            </div>
        `;
    }

    showErrorState() {
        const eventsGrid = document.getElementById('eventsGrid');
        if (!eventsGrid) return;

        eventsGrid.innerHTML = `
            <div class="events-empty">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Oops! Something went wrong</h3>
                <p>We couldn't load the events. Please try again later.</p>
                <button class="btn btn-primary" onclick="homepage.loadEvents()">
                    <i class="fas fa-refresh"></i>
                    Try Again
                </button>
            </div>
        `;
    }

    renderEvents() {
        const eventsGrid = document.getElementById('eventsGrid');
        if (!eventsGrid) return;

        // Filter out completed events - they should not appear on main page
        const visibleEvents = this.events.filter(event => event.status !== 'completed');

        if (visibleEvents.length === 0) {
            eventsGrid.innerHTML = `
                <div class="events-empty">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No events available</h3>
                    <p>Check back soon for exciting upcoming events!</p>
                </div>
            `;
            return;
        }

        eventsGrid.innerHTML = visibleEvents.map(event => this.createEventCard(event)).join('');
        
        // Add click listeners to event cards
        this.setupEventCardListeners();
    }

    createEventCard(event) {
        const formattedDate = this.formatEventDate(event.date);
        const formattedPrice = EventTicketingApp.formatPrice(event.price, event.currency);
        
        // Determine event state
        const isSoldOut = event.availableTickets === 0 || event.availableTickets === '0' || event.status === 'sold-out';
        const isCancelled = event.status === 'cancelled';
        const isActive = event.status === 'active' && !isSoldOut;
        
        // Determine badge to show
        let badge = '';
        let cardClass = '';
        let ctaText = 'View Details';
        let ctaIcon = 'fa-arrow-right';
        
        if (isSoldOut) {
            badge = '<div class="sold-out-badge"><i class="fas fa-ban"></i> SOLD OUT</div>';
            cardClass = 'sold-out';
            ctaText = 'Sold Out';
            ctaIcon = 'fa-ban';
        } else if (isCancelled) {
            badge = '<div class="cancelled-badge"><i class="fas fa-times-circle"></i> CANCELLED</div>';
            cardClass = 'cancelled';
            ctaText = 'Event Cancelled';
            ctaIcon = 'fa-times-circle';
        }
        
        return `
            <article class="event-card ${cardClass}" data-event-id="${event.id}" tabindex="0" role="button" aria-label="View details for ${event.title}">
                ${badge}
                <div class="event-card-image">
                    <i class="fas fa-calendar-star"></i>
                </div>
                <div class="event-card-content">
                    <h3 class="event-card-title">${event.title}</h3>
                    <div class="event-card-meta">
                        <div class="event-card-meta-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="event-card-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}</span>
                        </div>
                        <div class="event-card-meta-item">
                            <i class="fas fa-users"></i>
                            <span>Min age: ${event.minAge}+</span>
                        </div>
                        <div class="event-card-meta-item">
                            <i class="fas fa-tshirt"></i>
                            <span>${event.dressCode}</span>
                        </div>
                    </div>
                    <p class="event-card-description">${event.description}</p>
                    <div class="event-card-price">
                        <div class="event-card-price-amount">
                            ${formattedPrice}
                        </div>
                        <div class="event-card-cta">
                            <span>${ctaText}</span>
                            <i class="fas ${ctaIcon}"></i>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    setupEventCardListeners() {
        const eventCards = document.querySelectorAll('.event-card');
        
        eventCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const eventId = card.dataset.eventId;
                this.navigateToEventDetails(eventId);
            });

            // Add keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const eventId = card.dataset.eventId;
                    this.navigateToEventDetails(eventId);
                }
            });
        });
    }

    navigateToEventDetails(eventId) {
        // Store event data in sessionStorage for the details page
        const event = this.events.find(e => e.id == eventId);
        if (event) {
            sessionStorage.setItem('selectedEvent', JSON.stringify(event));
            window.location.href = `event-details.html?id=${eventId}`;
        }
    }

    formatEventDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const options = { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        const formattedDate = date.toLocaleDateString('en-US', options);

        if (diffDays === 0) {
            return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
            return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays < 7) {
            return formattedDate;
        } else {
            return formattedDate;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize homepage when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.homepage = new Homepage();
});
