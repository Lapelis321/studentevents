// ===== ADMIN DASHBOARD JAVASCRIPT =====

class AdminDashboard {
    constructor() {
        this.currentTab = 'events';
        this.events = [];
        this.workers = [];
        this.settings = {};
        this.init();
    }

    init() {
        this.loadMockData();
        this.loadSettingsFromStorage();
        this.setupEventListeners();
        this.renderCurrentTab();
    }

    setupEventListeners() {
        // Form submissions
        document.getElementById('organizationForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveOrganizationSettings();
        });

        document.getElementById('policyForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePolicySettings();
        });

        document.getElementById('systemForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSystemSettings();
        });

        document.getElementById('policyTextForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePolicyText();
        });

        document.getElementById('editEventForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedEvent();
        });
    }

    loadMockData() {
        // Mock events data
        this.events = [
            {
                id: 1,
                name: 'Spring Music Festival',
                date: '2024-04-15T19:00:00Z',
                location: 'University Campus',
                price: 25.00, // Legacy single price for backward compatibility
                priceTiers: [
                    { name: "General Admission", price: 25.00, totalTickets: 300, soldTickets: 200, enabled: true },
                    { name: "VIP", price: 50.00, totalTickets: 100, soldTickets: 80, enabled: true },
                    { name: "Student", price: 15.00, totalTickets: 100, soldTickets: 70, enabled: true }
                ],
                totalTickets: 500,
                soldTickets: 350,
                status: 'upcoming',
                description: 'A wonderful evening of live music featuring local artists.',
                image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
            },
            {
                id: 2,
                name: 'Tech Innovation Summit',
                date: '2024-04-22T14:00:00Z',
                location: 'Convention Center',
                price: 15.00,
                totalTickets: 300,
                soldTickets: 200,
                status: 'upcoming'
            },
            {
                id: 3,
                name: 'Art & Culture Night',
                date: '2024-04-28T18:30:00Z',
                location: 'City Art Gallery',
                price: 12.00,
                totalTickets: 100,
                soldTickets: 80,
                status: 'upcoming'
            },
            {
                id: 4,
                name: 'Winter Gala 2023',
                date: '2023-12-15T20:00:00Z',
                location: 'Grand Hotel',
                price: 45.00,
                totalTickets: 200,
                soldTickets: 200,
                status: 'completed'
            },
            {
                id: 5,
                name: 'Sports Championship Finals',
                date: '2024-05-05T16:00:00Z',
                location: 'Stadium Arena',
                price: 30.00,
                totalTickets: 1000,
                soldTickets: 500,
                status: 'upcoming'
            }
        ];

        // Mock workers data
        this.workers = [
            {
                id: 1,
                name: 'John Smith',
                username: 'worker1',
                password: 'scan123',
                email: 'john.smith@studentevents.com',
                phone: '+1 (555) 123-4567',
                role: 'Scanner',
                status: 'active',
                lastActive: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                name: 'Sarah Johnson',
                username: 'worker2',
                password: 'scan123',
                email: 'sarah.johnson@studentevents.com',
                phone: '+1 (555) 234-5678',
                role: 'Supervisor',
                status: 'active',
                lastActive: '2024-01-15T09:15:00Z'
            },
            {
                id: 3,
                name: 'Mike Davis',
                username: 'worker3',
                password: 'scan123',
                email: 'mike.davis@studentevents.com',
                phone: '+1 (555) 345-6789',
                role: 'Scanner',
                status: 'inactive',
                lastActive: '2024-01-10T14:20:00Z'
            },
            {
                id: 4,
                name: 'Emily Brown',
                username: 'worker4',
                password: 'scan123',
                email: 'emily.brown@studentevents.com',
                phone: '+1 (555) 456-7890',
                role: 'Coordinator',
                status: 'active',
                lastActive: '2024-01-15T11:45:00Z'
            }
        ];

        // Store workers in localStorage for worker login system
        this.saveWorkersToStorage();
    }

    saveWorkersToStorage() {
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
                break;
            case 'workers':
                this.renderWorkersTab();
                break;
            case 'settings':
                this.renderSettingsTab();
                break;
        }
    }

    renderEventsTab() {
        this.updateEventsStatistics();
        this.renderEventsTable();
    }

    updateEventsStatistics() {
        const totalEvents = this.events.length;
        const totalTickets = this.events.reduce((sum, event) => sum + event.soldTickets, 0);
        const totalRevenue = this.events.reduce((sum, event) => sum + (event.soldTickets * event.price), 0);
        const upcomingEvents = this.events.filter(event => event.status === 'upcoming').length;

        document.getElementById('totalEvents').textContent = totalEvents;
        document.getElementById('totalTickets').textContent = totalTickets.toLocaleString();
        document.getElementById('totalRevenue').textContent = `€${totalRevenue.toLocaleString()}`;
        document.getElementById('upcomingEvents').textContent = upcomingEvents;
    }

    renderEventsTable() {
        const tbody = document.getElementById('eventsTableBody');
        if (!tbody) return;

        if (this.events.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="table-empty">
                            <i class="fas fa-calendar-times"></i>
                            <h3>No events found</h3>
                            <p>Create your first event to get started</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.events.map(event => {
            const formattedDate = this.formatDate(event.date);
            const formattedPrice = EventTicketingApp.formatPrice(event.price, 'EUR');
            const ticketsSold = `${event.soldTickets}/${event.totalTickets}`;
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
                            <button class="action-btn view" onclick="adminDashboard.viewEvent(${event.id})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit" onclick="adminDashboard.editEvent(${event.id})" title="Edit Event">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="adminDashboard.deleteEvent(${event.id})" title="Delete Event">
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
                    <td colspan="8">
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
            const lastActive = this.formatDate(worker.lastActive);
            const statusBadge = this.createStatusBadge(worker.status);

            return `
                <tr>
                    <td><strong>${worker.name}</strong></td>
                    <td><code>${worker.username}</code></td>
                    <td>
                        <div class="password-field">
                            <span class="password-text" id="password-${worker.id}" data-password="${worker.password}">••••••••</span>
                            <button class="password-toggle-btn" onclick="adminDashboard.togglePassword(${worker.id})" title="Show/Hide Password">
                                <i class="fas fa-eye" id="eye-${worker.id}"></i>
                            </button>
                        </div>
                    </td>
                    <td>${worker.email}</td>
                    <td>${worker.role}</td>
                    <td>${statusBadge}</td>
                    <td>${lastActive}</td>
                    <td>
                        <div class="table-row-actions">
                            <button class="action-btn view" onclick="adminDashboard.viewWorker(${worker.id})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit" onclick="adminDashboard.editWorkerCredentials(${worker.id})" title="Edit Credentials">
                                <i class="fas fa-key"></i>
                            </button>
                            <button class="action-btn edit" onclick="adminDashboard.editWorker(${worker.id})" title="Edit Worker">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="adminDashboard.deleteWorker(${worker.id})" title="Delete Worker">
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
            completed: { icon: 'check', text: 'Completed' },
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
        EventTicketingApp.showNotification('Create Event modal would open here', 'info');
    }

    viewEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            EventTicketingApp.showNotification(`Viewing event: ${event.name}`, 'info');
        }
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        // Store the current event ID for saving
        this.editingEventId = eventId;

        // Populate the edit form
        document.getElementById('editEventName').value = event.name;
        document.getElementById('editEventDate').value = event.date.slice(0, 16); // Convert to datetime-local format
        document.getElementById('editEventLocation').value = event.location;
        document.getElementById('editEventDescription').value = event.description || '';
        document.getElementById('editEventImage').value = event.image || '';
        document.getElementById('editEventStatus').value = event.status;

        // Populate price tiers
        this.populatePriceTiers(event.priceTiers || [{ name: 'General', price: event.price, totalTickets: event.totalTickets, soldTickets: event.soldTickets, enabled: true }]);

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
                <label class="form-label">Price (€)</label>
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
            EventTicketingApp.showNotification('At least one price tier is required', 'warning');
        }
    }

    closeEditEventModal() {
        document.getElementById('editEventModal').classList.remove('active');
        this.editingEventId = null;
    }

    saveEditedEvent() {
        if (!this.editingEventId) return;

        const event = this.events.find(e => e.id === this.editingEventId);
        if (!event) return;

        // Get form data
        const formData = new FormData(document.getElementById('editEventForm'));
        
        // Update basic event properties
        event.name = formData.get('editEventName');
        event.date = formData.get('editEventDate') + ':00Z'; // Convert back to ISO format
        event.location = formData.get('editEventLocation');
        event.description = formData.get('editEventDescription');
        event.image = formData.get('editEventImage');
        event.status = formData.get('editEventStatus');

        // Process price tiers
        const priceTiers = [];
        let totalTickets = 0;
        let soldTickets = 0;
        let lowestPrice = Infinity;

        // Collect all price tier data
        const tierData = {};
        for (let [key, value] of formData.entries()) {
            if (key.startsWith('editPriceTier')) {
                const match = key.match(/editPriceTier(\w+)(\d+)/);
                if (match) {
                    const [, field, index] = match;
                    if (!tierData[index]) tierData[index] = {};
                    tierData[index][field] = value;
                }
            }
        }

        // Process each tier
        Object.keys(tierData).forEach(index => {
            const tier = tierData[index];
            const priceTier = {
                name: tier.Name || '',
                price: parseFloat(tier.Price) || 0,
                totalTickets: parseInt(tier.Total) || 0,
                soldTickets: parseInt(tier.Sold) || 0, // Preserve existing sold tickets
                enabled: tier.Enabled === 'on'
            };
            
            if (tier.Name && tier.Price) {
                priceTiers.push(priceTier);
                totalTickets += priceTier.totalTickets;
                soldTickets += priceTier.soldTickets;
                if (priceTier.price < lowestPrice) {
                    lowestPrice = priceTier.price;
                }
            }
        });

        // Update event with new data
        event.priceTiers = priceTiers;
        event.totalTickets = totalTickets;
        event.soldTickets = soldTickets; // Preserve existing sold tickets
        event.price = lowestPrice; // Update legacy price field

        // Close modal and refresh
        this.closeEditEventModal();
        this.renderEventsTab();
        
        EventTicketingApp.showNotification(`Event "${event.name}" updated successfully`, 'success');
    }

    deleteEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event && confirm(`Are you sure you want to delete "${event.name}"?`)) {
            this.events = this.events.filter(e => e.id !== eventId);
            this.renderEventsTab();
            EventTicketingApp.showNotification(`Event "${event.name}" deleted successfully`, 'success');
        }
    }

    exportEvents() {
        const csvContent = this.generateEventsCSV();
        this.downloadCSV(csvContent, 'events.csv');
        EventTicketingApp.showNotification('Events exported successfully', 'success');
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
                    'Price Paid': `€${participant.pricePaid}`,
                    'Purchase Date': participant.purchaseDate,
                    'Status': participant.status
                });
            });
        });

        // Export to CSV
        this.downloadCSV(participantData, 'event_participants.csv');
        EventTicketingApp.showNotification('Participant data exported successfully', 'success');
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
        EventTicketingApp.showNotification('Create Worker modal would open here', 'info');
    }

    viewWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (worker) {
            EventTicketingApp.showNotification(`Viewing worker: ${worker.name}`, 'info');
        }
    }

    editWorkerCredentials(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return;

        const action = confirm(`Edit credentials for ${worker.name}?\n\nClick OK to edit both username and password, or Cancel to edit just the password.`);
        
        if (action) {
            // Edit both username and password
            const newUsername = prompt(`Edit username for ${worker.name}:`, worker.username);
            if (newUsername === null) return; // User cancelled

            if (newUsername.trim() === '') {
                alert('Username cannot be empty!');
                return;
            }

            // Check if username already exists (excluding current worker)
            const existingWorker = this.workers.find(w => w.username === newUsername.trim() && w.id !== workerId);
            if (existingWorker) {
                alert('Username already exists! Please choose a different username.');
                return;
            }

            worker.username = newUsername.trim();
        }

        // Always allow password editing
        const generatePassword = confirm(`Edit password for ${worker.name}?\n\nClick OK to enter a custom password, or Cancel to generate a secure password.`);
        let newPassword;
        
        if (generatePassword) {
            newPassword = prompt(`Enter new password for ${worker.name}:`, worker.password);
            if (newPassword === null) return; // User cancelled
        } else {
            newPassword = this.generateSecurePassword();
            const useGenerated = confirm(`Generated secure password: ${newPassword}\n\nClick OK to use this password, or Cancel to enter your own.`);
            if (!useGenerated) {
                newPassword = prompt(`Enter new password for ${worker.name}:`, worker.password);
                if (newPassword === null) return; // User cancelled
            }
        }

        if (newPassword.trim() === '') {
            alert('Password cannot be empty!');
            return;
        }

        worker.password = newPassword.trim();

        // Update localStorage
        this.saveWorkersToStorage();

        // Re-render the table
        this.renderWorkersTable();

        EventTicketingApp.showNotification(`Credentials updated for ${worker.name}`, 'success');
    }

    editWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (worker) {
            EventTicketingApp.showNotification(`Full worker edit modal would open here for ${worker.name}`, 'info');
        }
    }

    togglePassword(workerId) {
        const passwordElement = document.getElementById(`password-${workerId}`);
        const eyeElement = document.getElementById(`eye-${workerId}`);
        
        if (!passwordElement || !eyeElement) return;
        
        const isHidden = passwordElement.textContent === '••••••••';
        const actualPassword = passwordElement.getAttribute('data-password');
        
        if (isHidden) {
            // Show password
            passwordElement.textContent = actualPassword;
            eyeElement.className = 'fas fa-eye-slash';
            passwordElement.style.fontFamily = 'monospace';
        } else {
            // Hide password
            passwordElement.textContent = '••••••••';
            eyeElement.className = 'fas fa-eye';
            passwordElement.style.fontFamily = '';
        }
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

    deleteWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (worker && confirm(`Are you sure you want to delete "${worker.name}"?`)) {
            this.workers = this.workers.filter(w => w.id !== workerId);
            this.saveWorkersToStorage(); // Update localStorage
            this.renderWorkersTab();
            EventTicketingApp.showNotification(`Worker "${worker.name}" deleted successfully`, 'success');
        }
    }

    exportWorkers() {
        const csvContent = this.generateWorkersCSV();
        this.downloadCSV(csvContent, 'workers.csv');
        EventTicketingApp.showNotification('Workers exported successfully', 'success');
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

    saveOrganizationSettings() {
        const formData = new FormData(document.getElementById('organizationForm'));
        const settings = Object.fromEntries(formData);
        
        // Save to localStorage for persistence
        localStorage.setItem('adminSettings', JSON.stringify({
            ...this.settings,
            organization: settings
        }));
        
        // Update current settings
        this.settings = { ...this.settings, organization: settings };
        
        // Apply organization name changes throughout the site
        this.applyOrganizationName(settings.orgName);
        
        console.log('Saving organization settings:', settings);
        EventTicketingApp.showNotification('Organization settings saved successfully', 'success');
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
        EventTicketingApp.showNotification('Policy settings saved successfully', 'success');
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
        EventTicketingApp.showNotification('System settings saved successfully', 'success');
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
        EventTicketingApp.showNotification('Policy text saved successfully', 'success');
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

        EventTicketingApp.showNotification('Data backup created successfully', 'success');
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

        EventTicketingApp.showNotification('All data exported successfully', 'success');
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
            
            EventTicketingApp.showNotification(`Cleared ${removedCount} old events`, 'success');
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
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
// Override events with API data immediately after dashboard loads
(async function() {
    const API_BASE_URL = 'https://studentevents-production.up.railway.app';
    try {
        const response = await fetch(`${API_BASE_URL}/api/events`);
        const apiEvents = await response.json();
        if (window.adminDashboard) {
            window.adminDashboard.events = apiEvents.map(e => ({
                id: e.id, name: e.title, date: e.date, location: e.location,
                price: e.price, totalTickets: e.totalTickets || 100,
                soldTickets: (e.totalTickets || 100) - (e.availableTickets || 0),
                status: e.is_active ? 'upcoming' : 'completed'
            }));
            window.adminDashboard.updateEventsStatistics();
            window.adminDashboard.renderCurrentTab();
            console.log('✅ Loaded ' + apiEvents.length + ' events from API');
        }
    } catch(e) { console.error('API load failed:', e); }
})();
