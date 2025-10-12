// ===== ADMIN DASHBOARD JAVASCRIPT =====

class AdminDashboard {
    constructor() {
        this.currentTab = 'events';
        this.events = [];
        this.workers = [];
        this.settings = {};
        this.showCompletedEvents = true; // Default to showing all events
        this.initialized = false;
        this.init();
    }

    async init() {
        // Prevent double initialization
        if (this.initialized) {
            console.log('⚠️ Dashboard already initialized, skipping...');
            return;
        }
        
        this.checkAndCleanOldData();
        await this.loadMockData();
        this.loadSettingsFromStorage();
        this.loadCompletedEventsPreference();
        this.setupEventListeners();
        this.renderCurrentTab();
        
        // Load policy data
        await this.loadPolicy();
        
        this.initialized = true;
        console.log('✅ Dashboard initialized');
    }

    checkAndCleanOldData() {
        try {
            const currentVersion = '1.0';
            const storedVersion = localStorage.getItem('adminDataVersion');
            
            console.log('🔍 Checking data version. Stored:', storedVersion, 'Current:', currentVersion);
            
            // ONLY clear data if there's NO version at all (first time running new code)
            if (!storedVersion) {
                console.log('🧹 No version found - clearing any old data format...');
                localStorage.removeItem('adminEvents');
                localStorage.removeItem('adminWorkers');
                localStorage.setItem('adminDataVersion', currentVersion);
                console.log('✅ Data cleared and version set to', currentVersion);
                return;
            }
            
            // If version exists and matches, data is good - don't touch it!
            if (storedVersion === currentVersion) {
                console.log('✅ Data version matches - no cleanup needed');
                return;
            }
            
            // If version exists but doesn't match, handle migration here
            console.log('⚠️ Version mismatch - may need migration from', storedVersion, 'to', currentVersion);
            
            console.log('✅ Data version check complete');
        } catch (error) {
            console.error('Error in checkAndCleanOldData:', error);
        }
    }

    setupEventListeners() {
        // Form submissions
        document.getElementById('organizationForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveOrganizationSettings();
        });

        document.getElementById('policyForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePolicy();
        });

        document.getElementById('systemForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSystemSettings();
        });

        // Event delegation for worker buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const button = e.target.closest('.action-btn');
                const workerId = button.dataset.workerId;
                const action = button.dataset.action;
                
                switch (action) {
                    case 'view':
                        this.viewWorker(workerId);
                        break;
                    case 'edit-credentials':
                        this.editWorkerCredentials(workerId);
                        break;
                    case 'edit':
                        this.editWorker(workerId);
                        break;
                    case 'delete':
                        this.deleteWorker(workerId);
                        break;
                }
            }
        });

        document.getElementById('policyTextForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePolicyText();
        });

        document.getElementById('editEventForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedEvent();
        });

        document.getElementById('createEventForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.saveNewEvent();
        }, { once: false });

        document.getElementById('createWorkerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewWorker();
        });
        
        document.getElementById('editWorkerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedWorker();
        });
    }

    async loadMockData() {
        // ALWAYS try to load from localStorage first - this takes absolute priority
        const savedEvents = this.loadEventsFromStorage();
        const savedWorkers = this.loadWorkersFromStorage();
        
        console.log('🔍 Checking localStorage for saved events...');
        console.log('Saved events found:', savedEvents);
        
        // Load events - localStorage takes absolute priority
        if (savedEvents && savedEvents.length > 0) {
            console.log(`📦 ✅ Using ${savedEvents.length} events from localStorage (PRIORITY)`);
            this.events = savedEvents;
            // Do NOT call API or use fallback if localStorage has data
            } else {
            console.log('⚠️ No saved events in localStorage, starting with empty array');
            // Start with empty array - admin can add events through the interface
            this.events = [];
            // DO NOT save empty/fallback data to localStorage
            // This allows created events to be the first ones saved
        }

        // Load workers from localStorage (priority) or start empty
        if (savedWorkers && savedWorkers.length > 0) {
            console.log(`📦 ✅ Using ${savedWorkers.length} workers from localStorage (PRIORITY)`);
            this.workers = savedWorkers;
        } else {
            console.log('⚠️ No saved workers, starting with empty array');
            this.workers = [];
        }
    }

    saveEventsToStorage() {
        try {
            const eventsJson = JSON.stringify(this.events);
            localStorage.setItem('adminEvents', eventsJson);
            localStorage.setItem('adminDataVersion', '1.0');
            console.log(`💾 Saved ${this.events.length} events to localStorage`);
            console.log('Events data:', this.events);
            
            // Verify it was saved
            const verification = localStorage.getItem('adminEvents');
            if (verification) {
                console.log('✅ Verification: Data successfully saved to localStorage');
            } else {
                console.error('❌ Verification failed: Data not found in localStorage');
            }
        } catch (error) {
            console.error('❌ Failed to save events to localStorage:', error);
        }
    }

    loadEventsFromStorage() {
        try {
            const savedEvents = localStorage.getItem('adminEvents');
            console.log('📖 Reading from localStorage. Raw data:', savedEvents ? `${savedEvents.length} characters` : 'null');
            if (savedEvents) {
                const parsed = JSON.parse(savedEvents);
                console.log(`✅ Successfully parsed ${parsed.length} events from localStorage`);
                return parsed;
            }
            console.log('⚠️ No events found in localStorage');
        } catch (error) {
            console.error('❌ Failed to load events from localStorage:', error);
        }
        return null;
    }

    saveWorkersToStorage() {
        try {
            // Save full worker data
            localStorage.setItem('adminWorkers', JSON.stringify(this.workers));
            localStorage.setItem('adminDataVersion', '1.0');
            
        // Create a simplified version for worker login system
        const workerCredentials = {};
        this.workers.forEach(worker => {
            if (worker.status === 'active') {
                workerCredentials[worker.username] = {
                    password: worker.password,
                    role: worker.role,
                    name: worker.name,
                    id: worker.id
                };
            }
        });
        localStorage.setItem('workerCredentials', JSON.stringify(workerCredentials));
            console.log('💾 Workers saved to localStorage');
        } catch (error) {
            console.error('Failed to save workers to localStorage:', error);
        }
    }

    loadWorkersFromStorage() {
        try {
            const savedWorkers = localStorage.getItem('adminWorkers');
            if (savedWorkers) {
                return JSON.parse(savedWorkers);
            }
        } catch (error) {
            console.error('Failed to load workers from localStorage:', error);
        }
        return null;
    }

    showNotification(message, type = 'info') {
        // Try to use EventTicketingApp if available
        if (window.EventTicketingApp && typeof window.EventTicketingApp.showNotification === 'function') {
            window.EventTicketingApp.showNotification(message, type);
        } else {
            // Fallback to simple alert
            console.log(`[${type.toUpperCase()}] ${message}`);
            alert(message);
        }
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab panel
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}Panel`).classList.add('active');

        this.currentTab = tabName;
        this.renderCurrentTab();
    }

    renderCurrentTab() {
        switch (this.currentTab) {
            case 'events':
                this.renderEventsTab();
                this.stopBookingsPolling();
                break;
            case 'bookings':
                this.loadBookings();
                this.startBookingsPolling();
                break;
            case 'workers':
                this.renderWorkersTab();
                this.stopBookingsPolling();
                break;
            case 'settings':
                this.renderSettingsTab();
                this.loadBankSettings();
                this.stopBookingsPolling();
                break;
        }
    }

    renderEventsTab() {
        this.updateEventsStatistics();
        this.renderEventsTable();
    }

    updateEventsStatistics() {
        // Filter events based on showCompletedEvents preference
        const displayedEvents = this.showCompletedEvents 
            ? this.events 
            : this.events.filter(e => e.status !== 'completed' && e.status !== 'completed-shown');

        const totalEvents = displayedEvents.length;
        const totalTickets = this.events.reduce((sum, event) => sum + event.soldTickets, 0);
        const totalRevenue = this.events.reduce((sum, event) => sum + (event.soldTickets * event.price), 0);
        const upcomingEvents = this.events.filter(event => event.status === 'upcoming').length;

        document.getElementById('totalEvents').textContent = totalEvents;
        document.getElementById('totalTickets').textContent = totalTickets.toLocaleString();
        document.getElementById('totalRevenue').textContent = `â‚¬${totalRevenue.toLocaleString()}`;
        document.getElementById('upcomingEvents').textContent = upcomingEvents;
    }

    loadCompletedEventsPreference() {
        const saved = localStorage.getItem('showCompletedEvents');
        this.showCompletedEvents = saved === null ? true : saved === 'true';
        
        // Update checkbox if it exists
        const checkbox = document.getElementById('showCompletedEvents');
        if (checkbox) {
            checkbox.checked = this.showCompletedEvents;
        }
        
        console.log('✅ Loaded completed events preference:', this.showCompletedEvents);
    }

    toggleCompletedEvents(show) {
        this.showCompletedEvents = show;
        localStorage.setItem('showCompletedEvents', show.toString());
        console.log('💾 Saved completed events preference:', show);
        
        // Re-render the events table
        this.renderEventsTable();
        this.updateEventsStatistics();
    }

    renderEventsTable() {
        const tbody = document.getElementById('eventsTableBody');
        if (!tbody) return;

        // Filter events based on showCompletedEvents preference
        const filteredEvents = this.showCompletedEvents 
            ? this.events 
            : this.events.filter(e => e.status !== 'completed' && e.status !== 'completed-shown');

        if (filteredEvents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="table-empty">
                            <i class="fas fa-calendar-times"></i>
                            <h3>No events found</h3>
                            <p>${this.events.length === 0 ? 'Create your first event to get started' : 'No events match the current filter'}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredEvents.map(event => {
            const formattedDate = this.formatDate(event.date);
            const formattedPrice = `€${typeof event.price === 'number' ? event.price.toFixed(2) : parseFloat(event.price || 0).toFixed(2)}`;
            const ticketsSold = `${event.soldTickets || 0}/${event.totalTickets || 0}`;
            const statusBadge = this.createStatusBadge(event.status);

            return `
                <tr>
                    <td><strong>${event.name}</strong></td>
                    <td>${formattedDate}</td>
                    <td>${event.location}</td>
                    <td>${formattedPrice}</td>
                    <td>${ticketsSold}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="table-row-actions">
                            <button class="action-btn view" onclick="adminDashboard.viewEvent('${event.id}')" title="View Event Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit" onclick="adminDashboard.editEvent('${event.id}')" title="Edit Event">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="adminDashboard.deleteEvent('${event.id}')" title="Delete Event">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderWorkersTab() {
        this.renderWorkersTable();
    }

    renderWorkersTable() {
        const tbody = document.getElementById('workersTableBody');
        if (!tbody) return;

        if (this.workers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="table-empty">
                            <i class="fas fa-users-slash"></i>
                            <h3>No workers found</h3>
                            <p>Add your first worker to get started</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.workers.map(worker => {
            const roleBadge = worker.role === 'supervisor' 
                ? '<span class="role-badge supervisor"><i class="fas fa-user-shield"></i> SUPERVISOR</span>'
                : '<span class="role-badge worker"><i class="fas fa-user"></i> WORKER</span>';

            return `
                <tr>
                    <td><strong>${worker.full_name || worker.name || 'Unknown'}</strong></td>
                    <td>${worker.email}</td>
                    <td>${roleBadge}</td>
                    <td>${worker.event_title || 'No event assigned'}</td>
                    <td>${worker.created_at ? new Date(worker.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                        <div class="table-row-actions">
                            <button class="action-btn view" onclick="adminDashboard.viewWorker('${worker.id}')" title="View Worker Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit" onclick="adminDashboard.editWorker('${worker.id}')" title="Edit Worker">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="adminDashboard.deleteWorker('${worker.id}')" title="Delete Worker">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderSettingsTab() {
        // Settings are already rendered in HTML, just ensure they're loaded
        this.loadSettings();
    }

    createStatusBadge(status) {
        const statusConfig = {
            active: { icon: 'check-circle', text: 'Active' },
            inactive: { icon: 'times-circle', text: 'Inactive' },
            upcoming: { icon: 'clock', text: 'Upcoming' },
            completed: { icon: 'check', text: 'Completed (Hidden)' },
            'completed-shown': { icon: 'check-circle', text: 'Completed (Visible)' },
            'sold-out': { icon: 'ban', text: 'Sold Out' },
            cancelled: { icon: 'times-circle', text: 'Cancelled' },
            pending: { icon: 'hourglass-half', text: 'Pending' }
        };

        const config = statusConfig[status] || { icon: 'question', text: status };
        
        return `
            <span class="status-badge ${status}">
                <i class="fas fa-${config.icon}"></i>
                ${config.text}
            </span>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Event Management Methods
    showCreateEventModal() {
        try {
            console.log('📝 Opening create event modal...');
            
            // Reset the form
            const form = document.getElementById('createEventForm');
            if (!form) {
                console.error('❌ Create event form not found!');
                return;
            }
            form.reset();
            
            // Set default date to tomorrow (local time)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            // Format as YYYY-MM-DDTHH:MM for datetime-local input
            const year = tomorrow.getFullYear();
            const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
            const day = String(tomorrow.getDate()).padStart(2, '0');
            const hours = String(tomorrow.getHours()).padStart(2, '0');
            const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
            const defaultDate = `${year}-${month}-${day}T${hours}:${minutes}`;
            
            const dateInput = document.getElementById('createEventDate');
            if (dateInput) {
                dateInput.value = defaultDate;
            }
            
            // Show the modal
            const modal = document.getElementById('createEventModal');
            if (!modal) {
                console.error('❌ Create event modal not found!');
                return;
            }
            modal.classList.add('active');
            console.log('✅ Modal opened successfully');
        } catch (error) {
            console.error('❌ Error opening modal:', error);
            alert('Error opening create event form: ' + error.message);
        }
    }

    closeCreateEventModal() {
        const modal = document.getElementById('createEventModal');
        const form = document.getElementById('createEventForm');
        
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Reset form after modal is fully closed and flag is reset
        setTimeout(() => {
            if (form && !this.isSubmitting) {
                form.reset();
            }
        }, 600);
    }

    async saveNewEvent() {
        // Prevent double submission
        if (this.isSubmitting) {
            console.log('⚠️ Already submitting, ignoring duplicate call');
            return;
        }
        
        this.isSubmitting = true;
        
        try {
            console.log('💾 Saving new event...');
            
            const nameInput = document.getElementById('createEventName');
            const dateInput = document.getElementById('createEventDate');
            const locationInput = document.getElementById('createEventLocation');
            const priceInput = document.getElementById('createEventPrice');
            const ticketsInput = document.getElementById('createEventTotalTickets');
            
            if (!nameInput || !dateInput || !locationInput || !priceInput || !ticketsInput) {
                console.error('❌ Required form fields not found!');
                this.showNotification('Error: Form fields not found. Please try refreshing the page.', 'error');
                this.isSubmitting = false;
                return;
            }
            
            // Validate required fields have values
            if (!nameInput.value || !dateInput.value || !locationInput.value || !priceInput.value || !ticketsInput.value) {
                console.error('❌ Required fields are empty!');
                this.showNotification('Please fill in all required fields', 'error');
                this.isSubmitting = false;
                return;
            }
            
            // Prepare event data for API
            const minAgeValue = document.getElementById('createEventMinAge')?.value;
            const dressCodeValue = document.getElementById('createEventDressCode')?.value;
            
            const eventData = {
                title: nameInput.value,
                date: new Date(dateInput.value).toISOString(),  // Convert datetime-local to proper ISO
                location: locationInput.value,
                description: document.getElementById('createEventDescription')?.value || '',
                additionalInfo: document.getElementById('createEventImage')?.value || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
                price: parseFloat(priceInput.value) || 0,
                currency: 'EUR',
                minAge: minAgeValue ? parseInt(minAgeValue) : null,
                dressCode: dressCodeValue || 'No specific dress code',
                totalTickets: parseInt(ticketsInput.value) || 100
            };
            
            // Try to save to backend API first
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
            const token = localStorage.getItem('adminToken');
            
            let createdEvent = null;
            
            if (token) {
                try {
                    console.log('📡 Calling backend API to create event...');
                    const response = await fetch(`${API_BASE_URL}/api/events`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(eventData)
                    });
                    
                    if (response.ok) {
                        createdEvent = await response.json();
                        console.log('✅ Event created on backend:', createdEvent);
                    } else {
                        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                        console.warn('⚠️ Backend API failed:', error.error);
                    }
                } catch (apiError) {
                    console.warn('⚠️ Backend API error:', apiError.message);
                }
            }
            
            // Create local event object
            const status = document.getElementById('createEventStatus')?.value || 'active';
            const availableTickets = status === 'sold-out' ? 0 : eventData.totalTickets;
            
            const newEvent = {
                id: createdEvent?.id || `event-${Date.now()}`,
                name: eventData.title,
                date: eventData.date,
                location: eventData.location,
                description: eventData.description,
                image: eventData.additionalInfo,
                price: eventData.price,
                totalTickets: eventData.totalTickets,
                availableTickets: availableTickets,
                soldTickets: 0,
                status: status,
                minAge: eventData.minAge,
                dressCode: eventData.dressCode,
                priceTiers: []
            };

            console.log('✅ New event data:', newEvent);
            this.events.push(newEvent);
            console.log('✅ Event added to array. Total events:', this.events.length);
            
            this.saveEventsToStorage();
            console.log('✅ Saved to localStorage');
            
            this.renderEventsTab();
            console.log('✅ Events tab rendered');
            
            this.closeCreateEventModal();
            console.log('✅ Modal closed');
            
            this.showNotification(`Event "${newEvent.name}" created successfully!`, 'success');
        } catch (error) {
            console.error('❌ Error creating event:', error);
            this.showNotification('Failed to create event: ' + error.message, 'error');
        } finally {
            // Reset the flag after a short delay to allow for re-submission if needed
            setTimeout(() => {
                this.isSubmitting = false;
            }, 500);
        }
    }

    viewEvent(eventId) {
        const event = this.events.find(e => e.id == eventId);  // Use == for loose comparison
        if (!event) {
            console.error('Event not found:', eventId, 'Available events:', this.events);
            return;
        }

        const statusBadge = event.status === 'active' ? '<span class="badge badge-success">Active</span>' :
                           event.status === 'sold-out' ? '<span class="badge badge-warning">Sold Out</span>' :
                           event.status === 'cancelled' ? '<span class="badge badge-danger">Cancelled</span>' :
                           '<span class="badge badge-secondary">Completed</span>';

        const content = `
            <div class="event-details-view">
                <div class="detail-row">
                    <div class="detail-label">Event Name:</div>
                    <div class="detail-value"><strong>${event.name}</strong></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Date & Time:</div>
                    <div class="detail-value">${this.formatDate(event.date)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Location:</div>
                    <div class="detail-value">${event.location}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Description:</div>
                    <div class="detail-value">${event.description || 'No description provided'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Price:</div>
                    <div class="detail-value">€${typeof event.price === 'number' ? event.price.toFixed(2) : parseFloat(event.price || 0).toFixed(2)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Tickets:</div>
                    <div class="detail-value">${event.soldTickets || 0} / ${event.totalTickets || 0} sold</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">${statusBadge}</div>
                </div>
                ${event.image ? `
                <div class="detail-row">
                    <div class="detail-label">Event Image:</div>
                    <div class="detail-value">
                        <img src="${event.image}" alt="${event.name}" style="max-width: 100%; max-height: 300px; border-radius: 8px; margin-top: 10px;">
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        document.getElementById('viewEventContent').innerHTML = content;
        document.getElementById('viewEventModal').classList.add('active');
    }

    closeViewEventModal() {
        document.getElementById('viewEventModal').classList.remove('active');
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id == eventId);  // Use == for loose comparison
        if (!event) {
            console.error('Event not found for editing:', eventId, 'Available events:', this.events);
            return;
        }

        // Store the current event ID for saving
        this.editingEventId = eventId;

        // Populate the edit form
        document.getElementById('editEventName').value = event.name;
        
        // Fix date timezone issue - convert UTC to local datetime-local format
        let eventDate = event.date;
        if (eventDate) {
            // Convert ISO date to local datetime-local format
            const dateObj = new Date(eventDate);
            // Get local date components (no timezone conversion)
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            eventDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
        document.getElementById('editEventDate').value = eventDate;
        document.getElementById('editEventLocation').value = event.location;
        document.getElementById('editEventDescription').value = event.description || '';
        document.getElementById('editEventImage').value = event.image || '';
        document.getElementById('editEventPrice').value = event.price || 0;
        document.getElementById('editEventTotalTickets').value = event.totalTickets || 100;
        document.getElementById('editEventMinAge').value = event.minAge || '';
        document.getElementById('editEventDressCode').value = event.dressCode || '';
        document.getElementById('editEventStatus').value = event.status;
        document.getElementById('editEventTicketsAvailableDate').value = event.ticketsAvailableDate || '';

        // Populate price tiers (optional - only if container exists)
        const priceTiersContainer = document.getElementById('editPriceTiers');
        if (priceTiersContainer) {
        this.populatePriceTiers(event.priceTiers || [{ name: 'General', price: event.price, totalTickets: event.totalTickets, soldTickets: event.soldTickets, enabled: true }]);
        }

        // Show the modal
        document.getElementById('editEventModal').classList.add('active');
    }

    populatePriceTiers(priceTiers) {
        const container = document.getElementById('editPriceTiers');
        container.innerHTML = '';

        priceTiers.forEach((tier, index) => {
            const tierElement = this.createPriceTierElement(tier, index, 'edit');
            container.appendChild(tierElement);
        });
    }

    createPriceTierElement(tier, index, prefix) {
        const div = document.createElement('div');
        div.className = 'price-tier';
        div.innerHTML = `
            <div class="form-group">
                <label class="form-label">Tier Name</label>
                <input type="text" class="form-input" name="${prefix}PriceTierName${index}" value="${tier.name}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Price (â‚¬)</label>
                <input type="number" class="form-input" name="${prefix}PriceTierPrice${index}" value="${tier.price}" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label class="form-label">Total Tickets</label>
                <input type="number" class="form-input" name="${prefix}PriceTierTotal${index}" value="${tier.totalTickets}" min="0" required>
            </div>
            <div class="form-group">
                <label class="form-label">Enabled</label>
                <input type="checkbox" class="form-checkbox" name="${prefix}PriceTierEnabled${index}" ${tier.enabled ? 'checked' : ''}>
            </div>
            <button type="button" class="price-tier-remove" onclick="adminDashboard.removePriceTier(this, '${prefix}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        return div;
    }

    addPriceTier(prefix) {
        const container = document.getElementById(`${prefix}PriceTiers`);
        const index = container.children.length;
        const tierElement = this.createPriceTierElement({
            name: '',
            price: 0,
            totalTickets: 0,
            soldTickets: 0,
            enabled: true
        }, index, prefix);
        container.appendChild(tierElement);
    }

    removePriceTier(button, prefix) {
        const container = document.getElementById(`${prefix}PriceTiers`);
        if (container.children.length > 1) {
            button.parentElement.remove();
        } else {
            this.showNotification('At least one price tier is required', 'warning');
        }
    }

    closeEditEventModal() {
        document.getElementById('editEventModal').classList.remove('active');
        this.editingEventId = null;
    }

    async saveEditedEvent() {
        if (!this.editingEventId) return;

        const event = this.events.find(e => e.id == this.editingEventId);  // Use == for loose comparison
        if (!event) {
            console.error('Event not found for saving:', this.editingEventId, 'Available events:', this.events);
            this.showNotification('Event not found', 'error');
            return;
        }

        console.log('💾 Saving edited event:', event.id);

        try {
            // Get form values directly from DOM (more reliable than FormData)
            const name = document.getElementById('editEventName').value;
            const date = document.getElementById('editEventDate').value;
            const location = document.getElementById('editEventLocation').value;
            const description = document.getElementById('editEventDescription').value;
            const image = document.getElementById('editEventImage').value;
            const price = parseFloat(document.getElementById('editEventPrice').value) || event.price || 0;
            const totalTickets = parseInt(document.getElementById('editEventTotalTickets').value) || event.totalTickets || 100;
            const status = document.getElementById('editEventStatus').value;
            const minAge = document.getElementById('editEventMinAge').value;
            const dressCode = document.getElementById('editEventDressCode').value;
            const ticketsAvailableDate = document.getElementById('editEventTicketsAvailableDate').value;
            
            console.log('📝 Form values:', { name, date, location, price, totalTickets, status, minAge, dressCode });
            
            // Convert date to ISO format for backend
            let isoDate = date;
            if (date) {
                // Convert datetime-local to ISO string (preserves local time)
                const dateObj = new Date(date);
                isoDate = dateObj.toISOString();
            }
            
            // Get authentication token
            const token = localStorage.getItem('adminToken');
            if (!token) {
                throw new Error('Not authenticated. Please login again.');
            }
            
            // Get API base URL
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'https://studentevents-production.up.railway.app';
            
            // Prepare event data for API
            const eventData = {
                title: name,
                date: isoDate,
                location: location,
                price: price,
                currency: 'EUR',
                minAge: minAge ? parseInt(minAge) : null,
                dressCode: dressCode || 'No specific dress code',
                description: description || '',
                additionalInfo: image || '',
                totalTickets: totalTickets,
                availableTickets: totalTickets - (event.soldTickets || 0),
                is_active: status === 'active' || status === 'upcoming',
                status: status,
                ticketsAvailableDate: ticketsAvailableDate || null
            };
            
            console.log('🚀 Sending to API:', eventData);
            
            // Call backend API to update event
            const response = await fetch(`${API_BASE_URL}/api/events/${this.editingEventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error || response.statusText}`);
            }
            
            const updatedEvent = await response.json();
            console.log('✅ Event updated via API:', updatedEvent);
            
            // Update local object with API response
            Object.assign(event, {
                name: updatedEvent.title,
                title: updatedEvent.title,
                date: updatedEvent.date,
                location: updatedEvent.location,
                description: updatedEvent.description,
                image: updatedEvent.additional_info,
                price: updatedEvent.price,
                totalTickets: updatedEvent.total_tickets,
                status: updatedEvent.status,
                minAge: updatedEvent.min_age,
                dressCode: updatedEvent.dress_code,
                ticketsAvailableDate: updatedEvent.tickets_available_date
            });
            
            console.log('✅ Local event updated:', event);
            
            // Save to localStorage
            this.saveEventsToStorage();
            console.log('✅ Saved to localStorage');
            
            // Close modal and refresh UI
            this.closeEditEventModal();
            this.renderEventsTab();
            
            // Force homepage to refresh by clearing its cache
            if (window.Homepage && window.Homepage.loadEvents) {
                console.log('🔄 Triggering homepage refresh...');
                window.Homepage.loadEvents();
            }
            
            this.showNotification(`Event "${event.name}" updated successfully!`, 'success');
            console.log('✅ Event edit completed');
            
        } catch (error) {
            console.error('❌ Error saving event:', error);
            this.showNotification('Failed to save event: ' + error.message, 'error');
        }
    }

    async deleteEvent(eventId) {
        const event = this.events.find(e => e.id == eventId);  // Use == for loose comparison
        if (!event) {
            console.error('Event not found for deletion:', eventId, 'Available events:', this.events);
            this.showNotification('Event not found', 'error');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete "${event.name}"?`)) {
            return;
        }
        
        try {
            // Show loading state
            this.showLoadingState('Deleting event...');
            
            // Get authentication token
            const token = localStorage.getItem('adminToken');
            if (!token) {
                throw new Error('Not authenticated. Please login again.');
            }
            
            // Get API base URL
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'https://studentevents-production.up.railway.app';
            
            // Call API to delete event
            const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
                throw new Error(errorData.error || `Delete failed: ${response.status} ${response.statusText}`);
            }
            
            // Remove from local array only after API success
            this.events = this.events.filter(e => e.id != eventId);  // Use != for loose comparison
            
            // Save to localStorage
            this.saveEventsToStorage();
            
            this.renderEventsTab();
            this.hideLoadingState();
            
            this.showNotification(`Event "${event.name}" deleted successfully`, 'success');
            
        } catch (error) {
            this.hideLoadingState();
            this.handleApiError(error, 'delete event');
        }
    }
    
    showLoadingState(message = 'Loading...') {
        // Remove existing loading overlay
        const existingOverlay = document.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        
        // Add styles
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        const loadingContent = loadingOverlay.querySelector('.loading-content');
        loadingContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        const spinner = loadingOverlay.querySelector('.loading-spinner');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        `;
        
        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(loadingOverlay);
    }
    
    hideLoadingState() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
    
    // Centralized error handling
    handleApiError(error, operation = 'operation') {
        console.error(`${operation} failed:`, error);
        
        let userMessage = 'An unexpected error occurred';
        
        if (error.message.includes('Not authenticated')) {
            userMessage = 'Session expired. Please login again.';
            // Redirect to login after a delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else if (error.message.includes('401')) {
            userMessage = 'Authentication failed. Please login again.';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else if (error.message.includes('403')) {
            userMessage = 'Access denied. You do not have permission to perform this action.';
        } else if (error.message.includes('404')) {
            userMessage = 'Resource not found. It may have been deleted.';
        } else if (error.message.includes('500')) {
            userMessage = 'Server error. Please try again later.';
        } else if (error.message.includes('Network')) {
            userMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message) {
            userMessage = error.message;
        }
        
        this.showNotification(`Failed to ${operation}: ${userMessage}`, 'error');
        
        // Show retry option for certain errors
        if (error.message.includes('Network') || error.message.includes('500')) {
            this.showRetryOption(operation);
        }
    }
    
    showRetryOption(operation) {
        const retryButton = document.createElement('button');
        retryButton.className = 'retry-button';
        retryButton.textContent = 'Retry';
        retryButton.style.cssText = `
            background: #3498db;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 10px;
        `;
        
        retryButton.onclick = () => {
            retryButton.remove();
            // This would need to be implemented per operation
            console.log(`Retrying ${operation}...`);
        };
        
        // Add retry button to the last notification
        const notifications = document.querySelectorAll('.notification');
        const lastNotification = notifications[notifications.length - 1];
        if (lastNotification) {
            lastNotification.appendChild(retryButton);
        }
    }

    exportEvents() {
        const csvContent = this.generateEventsCSV();
        this.downloadCSV(csvContent, 'events.csv');
        this.showNotification('Events exported successfully', 'success');
    }

    exportParticipants() {
        // Generate participant data for all events
        const participantData = [];
        
        this.events.forEach(event => {
            // Generate mock participant data for each event
            const participants = this.generateMockParticipants(event);
            
            participants.forEach(participant => {
                participantData.push({
                    'Event Name': event.name,
                    'Event Date': this.formatDate(event.date),
                    'Event Location': event.location,
                    'Participant Name': participant.name,
                    'Email': participant.email,
                    'Phone': participant.phone,
                    'Ticket Type': participant.ticketType,
                    'Price Paid': `â‚¬${participant.pricePaid}`,
                    'Purchase Date': participant.purchaseDate,
                    'Status': participant.status
                });
            });
        });

        // Export to CSV
        this.downloadCSV(participantData, 'event_participants.csv');
        this.showNotification('Participant data exported successfully', 'success');
    }

    generateMockParticipants(event) {
        const participants = [];
        const ticketTypes = event.priceTiers ? event.priceTiers.map(tier => tier.name) : ['General'];
        
        // Generate participants based on sold tickets
        for (let i = 0; i < event.soldTickets; i++) {
            const ticketType = ticketTypes[i % ticketTypes.length];
            const tier = event.priceTiers ? event.priceTiers.find(t => t.name === ticketType) : null;
            const price = tier ? tier.price : event.price;
            
            participants.push({
                name: `Participant ${i + 1}`,
                email: `participant${i + 1}@example.com`,
                phone: `+1-555-${String(i + 1).padStart(4, '0')}`,
                ticketType: ticketType,
                pricePaid: price,
                purchaseDate: this.formatDate(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)),
                status: 'Confirmed'
            });
        }
        
        return participants;
    }

    generateEventsCSV() {
        const headers = ['ID', 'Name', 'Date', 'Location', 'Price', 'Total Tickets', 'Sold Tickets', 'Status'];
        const rows = this.events.map(event => [
            event.id,
            event.name,
            event.date,
            event.location,
            event.price,
            event.totalTickets,
            event.soldTickets,
            event.status
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Worker Management Methods
    showCreateWorkerModal() {
        // Reset the form
        document.getElementById('createWorkerForm').reset();
        
        // Populate event dropdown
        this.populateWorkerEventDropdown('createWorkerEvent');
        
        // Show the modal
        document.getElementById('createWorkerModal').classList.add('active');
    }
    
    populateWorkerEventDropdown(selectId) {
        const eventSelect = document.getElementById(selectId);
        if (!eventSelect) return;
        
        // Keep the "No event assigned" option
        eventSelect.innerHTML = '<option value="">No event assigned</option>';
        
        // Add all events
        if (this.events && this.events.length > 0) {
            this.events.forEach(event => {
                const option = document.createElement('option');
                option.value = event.id;
                option.textContent = event.name || event.title;
                eventSelect.appendChild(option);
            });
        }
    }

    closeCreateWorkerModal() {
        document.getElementById('createWorkerModal').classList.remove('active');
        document.getElementById('createWorkerForm').reset();
    }

    async saveNewWorker() {
        try {
            const name = document.getElementById('createWorkerName').value;
            const email = document.getElementById('createWorkerEmail').value;
            const password = document.getElementById('createWorkerPassword').value;
            const role = document.getElementById('createWorkerRole')?.value || 'worker';
            const eventId = document.getElementById('createWorkerEvent')?.value || null;
            
            if (!name || !email || !password) {
                this.showNotification('Name, email and password are required', 'error');
                return;
            }
            
            // Try to save to backend API
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
            const token = localStorage.getItem('adminToken');
            
            let createdWorker = null;
            
            if (token) {
                try {
                    console.log('📡 Creating worker via API...');
                    const response = await fetch(`${API_BASE_URL}/api/workers`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ name, email, password, role, event_id: eventId })
                    });
                    
                    if (response.ok) {
                        createdWorker = await response.json();
                        console.log('✅ Worker created on backend:', createdWorker);
                    } else {
                        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                        console.warn('⚠️ Backend API failed:', error.error);
                    }
                } catch (apiError) {
                    console.warn('⚠️ Backend API error:', apiError.message);
                }
            }
            
            // Create local worker object
            const newWorker = {
                id: createdWorker?.id || `worker-${Date.now()}`,
                name,
                email,
                password,
                role,
                status: 'active',
                lastActive: null,
                createdAt: createdWorker?.createdAt || new Date().toISOString()
            };
            
            this.workers.push(newWorker);
            this.saveWorkersToStorage();
            this.renderWorkersTab();
            this.closeCreateWorkerModal();
            
            this.showNotification(`Worker "${name}" added successfully!`, 'success');
        } catch (error) {
            console.error('Error creating worker:', error);
            this.showNotification('Failed to add worker', 'error');
        }
    }

    viewWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return;

        const statusBadge = worker.status === 'active' ? '<span class="badge badge-success">Active</span>' :
                           worker.status === 'inactive' ? '<span class="badge badge-secondary">Inactive</span>' :
                           '<span class="badge badge-warning">Suspended</span>';

        const lastActive = worker.lastActive ? 
            this.formatDate(worker.lastActive) : 'Never';

        const content = `
            <div class="worker-details-view">
                <div class="detail-row">
                    <div class="detail-label">Name:</div>
                    <div class="detail-value"><strong>${worker.name}</strong></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Username:</div>
                    <div class="detail-value"><code>${worker.username}</code></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${worker.email}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Role:</div>
                    <div class="detail-value">${worker.role}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">${statusBadge}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Last Active:</div>
                    <div class="detail-value">${lastActive}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Created:</div>
                    <div class="detail-value">${this.formatDate(worker.createdAt)}</div>
                </div>
            </div>
        `;

        document.getElementById('viewWorkerContent').innerHTML = content;
        document.getElementById('viewWorkerModal').classList.add('active');
    }

    closeViewWorkerModal() {
        document.getElementById('viewWorkerModal').classList.remove('active');
    }

    async editWorkerCredentials(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return;

        // Edit password
        const generatePassword = confirm(`Edit password for ${worker.email}?\n\nClick OK to enter a custom password, or Cancel to generate a secure password.`);
        let newPassword;
        
        if (generatePassword) {
            newPassword = prompt(`Enter new password for ${worker.email}:`, worker.password);
            if (newPassword === null) return; // User cancelled
        } else {
            newPassword = this.generateSecurePassword();
            const useGenerated = confirm(`Generated secure password: ${newPassword}\n\nClick OK to use this password, or Cancel to enter your own.`);
            if (!useGenerated) {
                newPassword = prompt(`Enter new password for ${worker.email}:`, worker.password);
                if (newPassword === null) return; // User cancelled
            }
        }

        if (newPassword.trim() === '') {
            alert('Password cannot be empty!');
            return;
        }

        const updatedPassword = newPassword.trim();

        // Update via API
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                console.log(`🔐 Updating worker credentials via API...`);
                const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/api/workers/${workerId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ password: updatedPassword })
                });
                
                if (response.ok) {
                    console.log('✅ Worker credentials updated on API');
                } else {
                    console.warn('⚠️ API update failed, updating locally only...');
                }
            } catch (error) {
                console.warn('⚠️ API update error:', error.message);
            }
        }

        // Update locally
        worker.password = updatedPassword;
        this.saveWorkersToStorage();
        this.renderWorkersTable();

        this.showNotification(`Credentials updated for ${worker.email}`, 'success');
    }

    editWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) {
            console.error('Worker not found:', workerId);
            return;
        }
        
        this.editingWorkerId = workerId;
        
        // Populate the form
        document.getElementById('editWorkerName').value = worker.name || worker.full_name || '';
        document.getElementById('editWorkerEmail').value = worker.email || '';
        document.getElementById('editWorkerRole').value = worker.role || 'worker';
        document.getElementById('editWorkerStatus').value = worker.status || 'active';
        
        // Populate event dropdown
        this.populateWorkerEventDropdown('editWorkerEvent');
        
        // Set selected event
        if (worker.event_id) {
            document.getElementById('editWorkerEvent').value = worker.event_id;
        }
        
        // Show the modal
        document.getElementById('editWorkerModal').classList.add('active');
    }
    
    closeEditWorkerModal() {
        document.getElementById('editWorkerModal').classList.remove('active');
        document.getElementById('editWorkerForm').reset();
        this.editingWorkerId = null;
    }
    
    async saveEditedWorker() {
        if (!this.editingWorkerId) return;
        
        const worker = this.workers.find(w => w.id === this.editingWorkerId);
        if (!worker) {
            console.error('Worker not found:', this.editingWorkerId);
            return;
        }
        
        const name = document.getElementById('editWorkerName').value;
        const email = document.getElementById('editWorkerEmail').value;
        const role = document.getElementById('editWorkerRole').value;
        const status = document.getElementById('editWorkerStatus').value;
        const eventId = document.getElementById('editWorkerEvent')?.value || null;
        
        // Update via API
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                console.log(`💾 Updating worker via API...`);
                const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/api/workers/${this.editingWorkerId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name, email, role, status, event_id: eventId })
                });
                
                if (response.ok) {
                    console.log('✅ Worker updated on API');
        } else {
                    console.warn('⚠️ API update failed, updating locally only...');
                }
            } catch (error) {
                console.warn('⚠️ API update error:', error.message);
            }
        }
        
        // Update locally
        worker.name = name;
        worker.email = email;
        worker.role = role;
        worker.status = status;
        
        this.saveWorkersToStorage();
        this.renderWorkersTable();
        this.closeEditWorkerModal();
        
        this.showNotification(`Worker "${name}" updated successfully`, 'success');
    }


    generateSecurePassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        // Ensure at least one character from each category
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*';
        
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }
        
        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    viewWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) {
            console.error('Worker not found:', workerId);
            return;
        }
        
        // Populate the view modal content
        const viewContent = document.getElementById('viewWorkerContent');
        if (!viewContent) return;
        
        const roleBadge = worker.role === 'supervisor' 
            ? '<span class="role-badge supervisor"><i class="fas fa-user-shield"></i> SUPERVISOR</span>'
            : '<span class="role-badge worker"><i class="fas fa-user"></i> WORKER</span>';
        
        viewContent.innerHTML = `
            <div class="worker-details">
                <div class="detail-row">
                    <label><i class="fas fa-user"></i> Full Name:</label>
                    <strong>${worker.full_name || worker.name || 'N/A'}</strong>
                </div>
                <div class="detail-row">
                    <label><i class="fas fa-envelope"></i> Email:</label>
                    <strong>${worker.email}</strong>
                </div>
                <div class="detail-row">
                    <label><i class="fas fa-key"></i> Password:</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span id="workerPassword" style="letter-spacing: 2px;">••••••••</span>
                        <button class="btn btn-secondary btn-small" onclick="adminDashboard.togglePasswordVisibility('${worker.id}', '${worker.password || 'N/A'}')">
                            <i class="fas fa-eye" id="passwordIcon"></i> Show
                        </button>
                    </div>
                </div>
                <div class="detail-row">
                    <label><i class="fas fa-user-tag"></i> Role:</label>
                    <div>${roleBadge}</div>
                </div>
                <div class="detail-row">
                    <label><i class="fas fa-calendar-check"></i> Assigned Event:</label>
                    <strong>${worker.event_title || 'No event assigned'}</strong>
                </div>
                <div class="detail-row">
                    <label><i class="fas fa-clock"></i> Created:</label>
                    <strong>${worker.created_at ? new Date(worker.created_at).toLocaleString() : 'N/A'}</strong>
                </div>
            </div>
            <style>
                .worker-details { padding: 20px; }
                .detail-row { 
                    display: grid; 
                    grid-template-columns: 150px 1fr; 
                    gap: 15px; 
                    padding: 12px 0; 
                    border-bottom: 1px solid #e5e7eb;
                }
                .detail-row:last-child { border-bottom: none; }
                .detail-row label { 
                    color: #6b7280; 
                    font-weight: 500;
                }
                .detail-row label i { 
                    margin-right: 8px; 
                    color: var(--primary-500);
                }
                .btn-small { 
                    padding: 4px 12px; 
                    font-size: 12px;
                }
            </style>
        `;
        
        // Show the modal
        document.getElementById('viewWorkerModal').classList.add('active');
    }
    
    togglePasswordVisibility(workerId, password) {
        const passwordSpan = document.getElementById('workerPassword');
        const passwordIcon = document.getElementById('passwordIcon');
        const button = passwordIcon.closest('button');
        
        if (passwordSpan.textContent === '••••••••') {
            passwordSpan.textContent = password;
            passwordIcon.className = 'fas fa-eye-slash';
            button.innerHTML = '<i class="fas fa-eye-slash" id="passwordIcon"></i> Hide';
        } else {
            passwordSpan.textContent = '••••••••';
            passwordIcon.className = 'fas fa-eye';
            button.innerHTML = '<i class="fas fa-eye" id="passwordIcon"></i> Show';
        }
    }
    
    closeViewWorkerModal() {
        document.getElementById('viewWorkerModal').classList.remove('active');
    }

    async deleteWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker || !confirm(`Are you sure you want to delete "${worker.email}"?`)) {
            return;
        }
        
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                console.log(`🗑️ Deleting worker ${workerId} via API...`);
                const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/api/workers/${workerId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    console.log('✅ Worker deleted from API');
                } else {
                    console.warn('⚠️ API delete failed, performing local-only delete...');
                }
            } catch (error) {
                console.warn('⚠️ API delete error:', error.message);
            }
        }
        
        // Delete locally
            this.workers = this.workers.filter(w => w.id !== workerId);
        this.saveWorkersToStorage();
            this.renderWorkersTab();
        this.showNotification(`Worker "${worker.email}" deleted successfully`, 'success');
    }

    exportWorkers() {
        const csvContent = this.generateWorkersCSV();
        this.downloadCSV(csvContent, 'workers.csv');
        this.showNotification('Workers exported successfully', 'success');
    }

    generateWorkersCSV() {
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Last Active'];
        const rows = this.workers.map(worker => [
            worker.id,
            worker.name,
            worker.email,
            worker.phone,
            worker.role,
            worker.status,
            worker.lastActive
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Settings Methods
    loadSettings() {
        // Settings are already in the HTML form inputs
        // In a real app, you would load these from an API or localStorage
    }

    async saveOrganizationSettings() {
        const formData = new FormData(document.getElementById('organizationForm'));
        const settings = Object.fromEntries(formData);
        
        // Save via API if available
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
                
                // Update org_name setting
                if (settings.orgName) {
                    await fetch(`${API_BASE_URL}/api/admin/settings/org_name`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ value: settings.orgName })
                    });
                }
                
                console.log('✅ Organization settings saved to API');
            } catch (error) {
                console.error('❌ Error saving organization settings:', error);
            }
        }
        
        // Save to localStorage for persistence
        localStorage.setItem('adminSettings', JSON.stringify({
            ...this.settings,
            organization: settings
        }));
        
        // Update current settings
        this.settings = { ...this.settings, organization: settings };
        
        // Apply organization name changes throughout the site
        this.applyOrganizationName(settings.orgName);
        
        // Clear branding cache so changes are reflected
        if (window.OrgBranding && window.OrgBranding.clearCache) {
            window.OrgBranding.clearCache();
        }
        
        console.log('Saving organization settings:', settings);
        this.showNotification('Settings saved! Refresh the page to see changes across all pages.', 'success');
    }

    savePolicySettings() {
        const formData = new FormData(document.getElementById('policyForm'));
        const settings = Object.fromEntries(formData);
        
        // Save to localStorage for persistence
        localStorage.setItem('adminSettings', JSON.stringify({
            ...this.settings,
            policy: settings
        }));
        
        // Update current settings
        this.settings = { ...this.settings, policy: settings };
        
        // Apply policy changes
        this.applyPolicyChanges(settings);
        
        console.log('Saving policy settings:', settings);
        this.showNotification('Policy settings saved successfully', 'success');
    }

    saveSystemSettings() {
        const formData = new FormData(document.getElementById('systemForm'));
        const settings = Object.fromEntries(formData);
        
        // Save to localStorage for persistence
        localStorage.setItem('adminSettings', JSON.stringify({
            ...this.settings,
            system: settings
        }));
        
        // Update current settings
        this.settings = { ...this.settings, system: settings };
        
        console.log('Saving system settings:', settings);
        this.showNotification('System settings saved successfully', 'success');
    }

    async resetDashboardData() {
        const confirmed = confirm(
            '⚠️ WARNING: This will permanently delete all events, workers, and settings data.\n\n' +
            'This includes:\n' +
            '- All events (will also clear from main page)\n' +
            '- All workers and their credentials\n' +
            '- All custom settings\n\n' +
            'This action CANNOT be undone!\n\n' +
            'Are you sure you want to continue?'
        );
        
        if (!confirmed) {
            console.log('Reset cancelled by user');
            return;
        }
        
        try {
            console.log('🧹 Resetting all dashboard data...');
            
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
            const token = localStorage.getItem('adminToken');
            
            // Delete all events from backend
            if (this.events.length > 0) {
                console.log(`🗑️ Deleting ${this.events.length} events from backend...`);
                for (const event of this.events) {
                    try {
                        await fetch(`${API_BASE_URL}/api/events/${event.id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        console.log(`✅ Deleted event: ${event.name}`);
                    } catch (error) {
                        console.warn(`⚠️ Failed to delete event ${event.id}:`, error);
                    }
                }
            }
            
            // Delete all workers from backend
            if (this.workers.length > 0) {
                console.log(`🗑️ Deleting ${this.workers.length} workers from backend...`);
                for (const worker of this.workers) {
                    try {
                        await fetch(`${API_BASE_URL}/api/workers/${worker.id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        console.log(`✅ Deleted worker: ${worker.name}`);
                    } catch (error) {
                        console.warn(`⚠️ Failed to delete worker ${worker.id}:`, error);
                    }
                }
            }
            
            // Clear all localStorage items
            localStorage.removeItem('adminEvents');
            localStorage.removeItem('adminWorkers');
            localStorage.removeItem('adminSettings');
            localStorage.removeItem('workerCredentials');
            localStorage.removeItem('adminDataVersion');
            
            console.log('✅ All data cleared from localStorage and backend');
            
            // Reset in-memory data
            this.events = [];
            this.workers = [];
            this.settings = {};
            
            // Re-render the current tab
            this.renderCurrentTab();
            
            this.showNotification('Dashboard data has been reset successfully. Main page and worker data cleared.', 'success');
            
            console.log('✅ Dashboard reset complete');
        } catch (error) {
            console.error('❌ Error resetting dashboard:', error);
            alert('Failed to reset dashboard: ' + error.message);
        }
    }

    savePolicyText() {
        const formData = new FormData(document.getElementById('policyTextForm'));
        const policyTexts = Object.fromEntries(formData);
        
        // Save to localStorage for persistence
        localStorage.setItem('adminSettings', JSON.stringify({
            ...this.settings,
            policyTexts: policyTexts
        }));
        
        // Update current settings
        this.settings = { ...this.settings, policyTexts: policyTexts };
        
        // Apply policy text changes to the rules page
        this.applyPolicyTextChanges(policyTexts);
        
        console.log('Saving policy text:', policyTexts);
        this.showNotification('Policy text saved successfully', 'success');
    }

    // Helper methods to apply settings changes
    applyOrganizationName(orgName) {
        // Update all instances of "StudentEvents" with the new organization name
        const elements = document.querySelectorAll('.logo span, .admin-badge span, .footer-info p');
        elements.forEach(element => {
            if (element.textContent.includes('StudentEvents')) {
                element.textContent = element.textContent.replace('StudentEvents', orgName);
            }
        });
        
        // Update page titles
        document.title = document.title.replace('StudentEvents', orgName);
        
        // Store organization name for other pages to use
        localStorage.setItem('organizationName', orgName);
        
        // Update any other hardcoded references
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.textContent && element.textContent.includes('StudentEvents')) {
                element.textContent = element.textContent.replace('StudentEvents', orgName);
            }
        });
    }
    
    applyPolicyChanges(policySettings) {
        // Update policy-related elements on the page
        console.log('Applying policy changes:', policySettings);
        
        // Update contact information in the rules page
        if (policySettings.contactEmail || policySettings.contactPhone) {
            this.updateContactInfo(policySettings.contactEmail, policySettings.contactPhone);
        }
        
        // Update refund policy display
        if (policySettings.refundPolicy) {
            this.updateRefundPolicy(policySettings.refundPolicy);
        }
        
        // Update service fee display
        if (policySettings.serviceFee) {
            this.updateServiceFee(policySettings.serviceFee);
        }
    }
    
    updateContactInfo(email, phone) {
        // This would update the contact section in rules.html
        // For now, we'll store it for when the rules page is loaded
        localStorage.setItem('contactEmail', email || 'contact@studentevents.com');
        localStorage.setItem('contactPhone', phone || '+1 (555) 123-4567');
    }
    
    updateRefundPolicy(hours) {
        // Store refund policy for use in other parts of the app
        localStorage.setItem('refundPolicyHours', hours);
    }
    
    updateServiceFee(fee) {
        // Store service fee for use in checkout
        localStorage.setItem('serviceFee', fee);
    }
    
    applyPolicyTextChanges(policyTexts) {
        // Store policy texts for the rules page to use
        localStorage.setItem('privacyPolicyText', policyTexts.privacyPolicyText || '');
        localStorage.setItem('refundPolicyText', policyTexts.refundPolicyText || '');
        localStorage.setItem('termsOfServiceText', policyTexts.termsOfServiceText || '');
    }
    
    loadSettingsFromStorage() {
        // Load settings from localStorage on page load
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            this.applySavedSettings();
        }
    }
    
    applySavedSettings() {
        // Apply saved settings to form inputs
        if (this.settings.organization) {
            Object.keys(this.settings.organization).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = this.settings.organization[key];
                }
            });
        }
        
        if (this.settings.policy) {
            Object.keys(this.settings.policy).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = this.settings.policy[key];
                }
            });
        }
        
        if (this.settings.system) {
            Object.keys(this.settings.system).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = this.settings.system[key] === 'on';
                    } else {
                        input.value = this.settings.system[key];
                    }
                }
            });
        }
        
        if (this.settings.policyTexts) {
            Object.keys(this.settings.policyTexts).forEach(key => {
                const textarea = document.getElementById(key);
                if (textarea) {
                    textarea.value = this.settings.policyTexts[key];
                }
            });
        }
    }

    // Data Management Methods
    backupData() {
        const backupData = {
            events: this.events,
            workers: this.workers,
            settings: this.settings,
            timestamp: new Date().toISOString()
        };

        const jsonContent = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `studentevents_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Data backup created successfully', 'success');
    }

    exportAllData() {
        const allData = {
            events: this.generateEventsCSV(),
            workers: this.generateWorkersCSV()
        };

        // Create a zip-like structure (simplified for demo)
        const exportContent = `Events Data:\n${allData.events}\n\nWorkers Data:\n${allData.workers}`;
        
        const blob = new Blob([exportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `studentevents_export_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('All data exported successfully', 'success');
    }

    clearOldData() {
        if (confirm('Are you sure you want to clear old data? This action cannot be undone.')) {
            // Remove completed events older than 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            const originalCount = this.events.length;
            this.events = this.events.filter(event => {
                const eventDate = new Date(event.date);
                return event.status !== 'completed' || eventDate > sixMonthsAgo;
            });
            
            const removedCount = originalCount - this.events.length;
            this.renderEventsTab();
            
            this.showNotification(`Cleared ${removedCount} old events`, 'success');
        }
    }

    // Utility Methods
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ===== POLICY & RULES MANAGEMENT =====
    
    async loadPolicy() {
        try {
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
            const response = await fetch(`${API_BASE_URL}/api/policy`);
            
            if (response.ok) {
                const policy = await response.json();
                console.log('📄 Policy loaded:', policy);
                
                // Handle new structure with metadata and sections
                if (policy.metadata && policy.sections) {
                    // New structure - populate from sections
                    const sectionMap = {};
                    policy.sections.forEach(section => {
                        sectionMap[section.id] = section.content;
                    });
                    
                    document.getElementById('termsOfService').value = sectionMap['terms-of-service'] || '';
                    document.getElementById('privacyPolicy').value = sectionMap['privacy-policy'] || '';
                    document.getElementById('eventGuidelines').value = sectionMap['event-guidelines'] || '';
                    document.getElementById('ticketPolicy').value = sectionMap['ticket-policy'] || '';
                    document.getElementById('refundPolicy').value = sectionMap['refund-policy'] || '';
                    document.getElementById('codeOfConduct').value = sectionMap['code-of-conduct'] || '';
                    
                    document.getElementById('currentPolicyVersion').textContent = policy.metadata.version || '1.0';
                    document.getElementById('policyLastUpdated').textContent = policy.metadata.lastUpdated 
                        ? new Date(policy.metadata.lastUpdated).toLocaleDateString() 
                        : '--';
                } else {
                    // Old structure - direct properties
                    document.getElementById('termsOfService').value = policy.termsOfService || '';
                    document.getElementById('privacyPolicy').value = policy.privacyPolicy || '';
                    document.getElementById('eventGuidelines').value = policy.eventGuidelines || '';
                    document.getElementById('ticketPolicy').value = policy.ticketPolicy || '';
                    document.getElementById('refundPolicy').value = policy.refundPolicy || '';
                    document.getElementById('codeOfConduct').value = policy.codeOfConduct || '';
                    document.getElementById('currentPolicyVersion').textContent = policy.version || '1.0';
                    document.getElementById('policyLastUpdated').textContent = policy.lastUpdated 
                        ? new Date(policy.lastUpdated).toLocaleDateString() 
                        : '--';
                }
            } else {
                console.warn('Failed to load policy from API');
            }
        } catch (error) {
            console.error('Error loading policy:', error);
        }
    }
    
    async savePolicy() {
        try {
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
            const token = localStorage.getItem('adminToken');
            
            // Build payload for the new backend endpoint
            const payload = {
                terms_of_service: document.getElementById('termsOfService')?.value || '',
                privacy_policy: document.getElementById('privacyPolicy')?.value || '',
                event_guidelines: document.getElementById('eventGuidelines')?.value || '',
                ticket_policy: document.getElementById('ticketPolicy')?.value || '',
                refund_policy: document.getElementById('refundPolicy')?.value || '',
                code_of_conduct: document.getElementById('codeOfConduct')?.value || ''
            };
            
            const response = await fetch(`${API_BASE_URL}/api/admin/policy`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                console.log('✅ Policy updated successfully');
                this.showNotification('Policy & Rules updated successfully!', 'success');
                
                // Reload policy to refresh the form
                await this.loadPolicy();
            } else {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(error.error || 'Failed to update policy');
            }
        } catch (error) {
            console.error('Error saving policy:', error);
            this.showNotification(`Failed to update policy: ${error.message}`, 'error');
        }
    }

    // ===== BOOKINGS MANAGEMENT =====
    
    async loadBookings() {
        try {
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
            const token = localStorage.getItem('adminToken');
            
            const response = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                this.bookings = await response.json();
                this.allBookings = [...this.bookings]; // Keep original copy for filtering
                console.log('✅ Loaded bookings:', this.bookings.length);
                this.populateEventFilter();
                this.restoreFilterStates(); // Restore saved filters
                this.updateBookingsStats();
            } else {
                throw new Error('Failed to load bookings');
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.showNotification('Failed to load bookings', 'error');
        }
    }
    
    restoreFilterStates() {
        // Restore event filter
        const savedEventFilter = localStorage.getItem('bookingEventFilter') || 'all';
        const eventFilterEl = document.getElementById('bookingEventFilter');
        if (eventFilterEl) {
            eventFilterEl.value = savedEventFilter;
        }
        
        // Restore status filter
        const savedStatusFilter = localStorage.getItem('bookingStatusFilter') || 'pending';
        const statusFilterEl = document.getElementById('bookingStatusFilter');
        if (statusFilterEl) {
            statusFilterEl.value = savedStatusFilter;
        }
        
        // Apply filters
        this.applyFilters();
    }
    
    applyFilters() {
        const eventFilter = document.getElementById('bookingEventFilter')?.value || 'all';
        const statusFilter = document.getElementById('bookingStatusFilter')?.value || 'pending';
        const searchTerm = this.bookingSearchTerm || '';
        
        // Filter by event first
        let filtered = eventFilter === 'all' 
            ? [...this.allBookings] 
            : this.allBookings.filter(b => b.event_id === eventFilter);
        
        // Then filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(b => b.payment_status === statusFilter);
        }
        
        // Then filter by search term (name, email, or reference)
        if (searchTerm) {
            filtered = filtered.filter(b => {
                const firstName = (b.first_name || '').toLowerCase();
                const lastName = (b.last_name || '').toLowerCase();
                const email = (b.email || '').toLowerCase();
                const reference = (b.payment_reference || '').toLowerCase();
                
                return firstName.includes(searchTerm) || 
                       lastName.includes(searchTerm) || 
                       email.includes(searchTerm) || 
                       reference.includes(searchTerm);
            });
        }
        
        this.bookings = filtered;
        this.renderBookings(statusFilter);
    }
    
    populateEventFilter() {
        const eventFilter = document.getElementById('bookingEventFilter');
        if (!eventFilter) return;
        
        // Get unique events from bookings
        const events = new Map();
        (this.allBookings || []).forEach(b => {
            if (b.event_title && b.event_id) {
                events.set(b.event_id, b.event_title);
            }
        });
        
        // Populate dropdown
        eventFilter.innerHTML = '<option value="all">All Events</option>' +
            Array.from(events.entries())
                .map(([id, title]) => `<option value="${id}">${title}</option>`)
                .join('');
    }
    
    filterBookingsByEvent(eventId) {
        // Save filter state
        localStorage.setItem('bookingEventFilter', eventId);
        
        // Apply filters
        this.applyFilters();
        this.updateBookingsStats();
    }
    
    renderBookings(filter = 'pending') {
        const tbody = document.getElementById('bookingsTableBody');
        if (!tbody) return;
        
        let filteredBookings = this.bookings || [];
        if (filter !== 'all') {
            filteredBookings = filteredBookings.filter(b => b.payment_status === filter);
        }
        
        if (filteredBookings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No ${filter !== 'all' ? filter : ''} bookings</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = filteredBookings.map(booking => {
            const isExpired = new Date(booking.payment_deadline) < new Date();
            const statusBadge = this.getBookingStatusBadge(booking.payment_status, isExpired);
            
            return `
                <tr>
                    <td><code style="font-size: 0.85em;">${booking.payment_reference}</code></td>
                    <td>
                        <strong>${booking.event_title || 'N/A'}</strong><br>
                        <small style="color: #666;">${booking.event_date ? new Date(booking.event_date).toLocaleDateString() : ''}</small>
                    </td>
                    <td>${booking.first_name} ${booking.last_name}</td>
                    <td>
                        <small>${booking.email}</small><br>
                        <small style="color: #666;">${booking.phone}</small>
                    </td>
                    <td>${booking.quantity}</td>
                    <td><strong>€${parseFloat(booking.total_amount).toFixed(2)}</strong></td>
                    <td>${statusBadge}</td>
                    <td>
                        <small style="color: ${isExpired ? '#e53e3e' : '#666'};">
                            ${new Date(booking.payment_deadline).toLocaleString()}
                        </small>
                    </td>
                    <td><small>${new Date(booking.created_at).toLocaleString()}</small></td>
                    <td>
                        <div class="table-row-actions">
                            ${booking.payment_status === 'pending' ? `
                                <button class="action-btn edit" onclick="adminDashboard.markBookingAsPaid('${booking.id}')" title="Approve Payment">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="action-btn delete" onclick="adminDashboard.cancelBooking('${booking.id}')" title="Cancel Booking">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                            <button class="action-btn view" onclick="adminDashboard.viewBooking('${booking.id}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn delete" onclick="adminDashboard.deleteBooking('${booking.id}')" title="Delete Permanently">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    getBookingStatusBadge(status, isExpired) {
        if (status === 'pending' && isExpired) {
            return '<span class="status-badge expired"><i class="fas fa-clock"></i> EXPIRED</span>';
        }
        
        const badgeConfigs = {
            pending: { class: 'pending', icon: 'clock', text: 'PENDING' },
            paid: { class: 'active', icon: 'check-circle', text: 'PAID' },
            cancelled: { class: 'cancelled', icon: 'times-circle', text: 'CANCELLED' },
            refunded: { class: 'soldout', icon: 'undo', text: 'REFUNDED' }
        };
        
        const config = badgeConfigs[status] || { class: 'pending', icon: 'question', text: status.toUpperCase() };
        
        return `<span class="status-badge ${config.class}"><i class="fas fa-${config.icon}"></i> ${config.text}</span>`;
    }
    
    updateBookingsStats() {
        const pending = (this.bookings || []).filter(b => b.payment_status === 'pending').length;
        const paid = (this.bookings || []).filter(b => b.payment_status === 'paid').length;
        const expired = (this.bookings || []).filter(b => {
            return b.payment_status === 'pending' && new Date(b.payment_deadline) < new Date();
        }).length;
        const pendingRevenue = (this.bookings || [])
            .filter(b => b.payment_status === 'pending')
            .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
        
        document.getElementById('pendingBookings').textContent = pending;
        document.getElementById('paidBookings').textContent = paid;
        document.getElementById('expiredBookings').textContent = expired;
        document.getElementById('pendingRevenue').textContent = `€${pendingRevenue.toFixed(2)}`;
    }
    
    async markBookingAsPaid(bookingId) {
        if (!confirm('Mark this booking as paid? This will generate tickets for the customer.')) return;
        
        try {
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
            const token = localStorage.getItem('adminToken');
            
            const response = await fetch(`${API_BASE_URL}/api/admin/bookings/${bookingId}/confirm`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.showNotification('Booking marked as paid!', 'success');
                await this.loadBookings();
            } else {
                throw new Error('Failed to confirm booking');
            }
        } catch (error) {
            console.error('Error confirming booking:', error);
            this.showNotification('Failed to confirm booking', 'error');
        }
    }
    
    async cancelBooking(bookingId) {
        if (!confirm('Cancel this booking? This action cannot be undone.')) return;
        
        try {
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
            const token = localStorage.getItem('adminToken');
            
            const response = await fetch(`${API_BASE_URL}/api/admin/bookings/${bookingId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                this.showNotification('Booking cancelled', 'success');
                await this.loadBookings();
            } else {
                throw new Error('Failed to cancel booking');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            this.showNotification('Failed to cancel booking', 'error');
        }
    }
    
    async deleteBooking(bookingId) {
        if (!confirm('⚠️ Permanently delete this booking? This action CANNOT be undone and will remove all booking data from the database.')) return;
        
        try {
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
            const token = localStorage.getItem('adminToken');
            
            const response = await fetch(`${API_BASE_URL}/api/admin/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                this.showNotification('Booking permanently deleted', 'success');
                await this.loadBookings();
            } else {
                throw new Error('Failed to delete booking');
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            this.showNotification('Failed to delete booking', 'error');
        }
    }
    
    viewBooking(bookingId) {
        const booking = (this.bookings || []).find(b => b.id === bookingId);
        if (!booking) return;
        
        const isExpired = new Date(booking.payment_deadline) < new Date();
        
        alert(`Booking Details:
        
Reference: ${booking.payment_reference}
Event: ${booking.event_title}
Customer: ${booking.first_name} ${booking.last_name}
Email: ${booking.email}
Phone: ${booking.phone}
ISM Student: ${booking.is_ism_student ? 'Yes' : 'No'}
Quantity: ${booking.quantity}
Unit Price: €${parseFloat(booking.unit_price).toFixed(2)}
Discount: €${parseFloat(booking.discount).toFixed(2)}
Total Amount: €${parseFloat(booking.total_amount).toFixed(2)}
Status: ${booking.payment_status.toUpperCase()}${isExpired ? ' (EXPIRED)' : ''}
Payment Deadline: ${new Date(booking.payment_deadline).toLocaleString()}
Created: ${new Date(booking.created_at).toLocaleString()}`);
    }
    
    filterBookings(status) {
        // Save filter state
        localStorage.setItem('bookingStatusFilter', status);
        
        // Apply filters
        this.applyFilters();
        this.updateBookingsStats();
    }
    
    searchBookings(searchTerm) {
        // Store search term
        this.bookingSearchTerm = searchTerm.toLowerCase().trim();
        
        // Apply filters (which includes search)
        this.applyFilters();
        this.updateBookingsStats();
    }
    
    async refreshBookings() {
        this.showNotification('Refreshing bookings...', 'info');
        await this.loadBookings();
    }
    
    startBookingsPolling() {
        if (this.bookingsInterval) return; // Already polling
        
        console.log('🔄 Starting bookings auto-refresh (every 10 seconds)');
        this.bookingsInterval = setInterval(async () => {
            if (this.currentTab === 'bookings') {
                console.log('🔄 Auto-refreshing bookings...');
                await this.loadBookings();
            }
        }, 10000); // Refresh every 10 seconds
    }
    
    stopBookingsPolling() {
        if (this.bookingsInterval) {
            console.log('🛑 Stopping bookings auto-refresh');
            clearInterval(this.bookingsInterval);
            this.bookingsInterval = null;
        }
    }
    
    async exportBookingsToExcel() {
        try {
            const bookings = this.bookings || [];
            
            if (bookings.length === 0) {
                this.showNotification('No bookings to export', 'warning');
                return;
            }
            
            // Transform data for Excel
            const excelData = bookings.map(b => ({
                'Reference': b.payment_reference,
                'Event': b.event_title,
                'Event Date': b.event_date ? new Date(b.event_date).toLocaleDateString() : 'N/A',
                'First Name': b.first_name,
                'Last Name': b.last_name,
                'Email': b.email,
                'Phone': b.phone,
                'ISM Student': b.is_ism_student ? 'Yes' : 'No',
                'Quantity': b.quantity,
                'Unit Price': `€${parseFloat(b.unit_price || 0).toFixed(2)}`,
                'Discount': `€${parseFloat(b.discount || 0).toFixed(2)}`,
                'Total Amount': `€${parseFloat(b.total_amount).toFixed(2)}`,
                'Status': b.payment_status.toUpperCase(),
                'Payment Deadline': new Date(b.payment_deadline).toLocaleString(),
                'Created': new Date(b.created_at).toLocaleString()
            }));
            
            // Use SheetJS to generate Excel file
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
            
            // Auto-size columns
            const maxWidth = excelData.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => String(v).length)), 10);
            ws['!cols'] = Object.keys(excelData[0]).map(() => ({ wch: Math.min(maxWidth, 50) }));
            
            // Generate filename with current date
            const filename = `bookings-${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            this.showNotification(`Exported ${bookings.length} bookings to ${filename}`, 'success');
        } catch (error) {
            console.error('Error exporting bookings:', error);
            this.showNotification('Failed to export bookings', 'error');
        }
    }
    
    // ===== BANK SETTINGS MANAGEMENT =====
    
    async loadBankSettings() {
        try {
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
            
            const response = await fetch(`${API_BASE_URL}/api/settings`);
            
            if (response.ok) {
                const settings = await response.json();
                console.log('✅ Loaded bank settings:', settings);
                
                // Populate form fields - only existing fields
                const recipientInput = document.getElementById('bankRecipientName');
                const ibanInput = document.getElementById('bankIban');
                const emailInput = document.getElementById('supportEmail');
                const phoneInput = document.getElementById('supportPhone');
                const hoursInput = document.getElementById('supportWorkingHours');
                
                if (recipientInput) recipientInput.value = settings.bank_recipient_name || '';
                if (ibanInput) ibanInput.value = settings.bank_iban || '';
                if (emailInput) emailInput.value = settings.support_email || '';
                if (phoneInput) phoneInput.value = settings.support_phone || '';
                if (hoursInput) hoursInput.value = settings.support_working_hours || 'Mon-Fri 9:00-17:00';
            } else {
                throw new Error('Failed to load bank settings');
            }
        } catch (error) {
            console.error('[ERROR] Failed to load bank settings:', error);
            // Don't show alert, just log error
            console.log('[INFO] Settings form fields may need to be populated manually');
        }
    }
    
    async saveBankSettings(event) {
        event.preventDefault();
        
        try {
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
            const token = localStorage.getItem('adminToken');
            
            // Only get values from existing fields
            const settings = {
                bank_recipient_name: document.getElementById('bankRecipientName')?.value || '',
                bank_iban: document.getElementById('bankIban')?.value || '',
                support_email: document.getElementById('supportEmail')?.value || '',
                support_phone: document.getElementById('supportPhone')?.value || '',
                support_working_hours: document.getElementById('supportWorkingHours')?.value || ''
            };
            
            // Update each setting individually
            for (const [key, value] of Object.entries(settings)) {
                const response = await fetch(`${API_BASE_URL}/api/admin/settings/${key}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ value })
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to update ${key}`);
                }
            }
            
            this.showNotification('Bank settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving bank settings:', error);
            this.showNotification('Failed to save bank settings', 'error');
        }
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
// API data loading is now handled in loadMockData() function
