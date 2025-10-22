// Fallback event editing for when Railway server is unavailable
class AdminDashboardFallback {
    constructor() {
        this.events = this.loadEventsFromStorage();
        this.workers = this.loadWorkersFromStorage();
    }

    // Load events from localStorage
    loadEventsFromStorage() {
        try {
            const stored = localStorage.getItem('adminEvents');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading events from storage:', error);
            return [];
        }
    }

    // Load workers from localStorage
    loadWorkersFromStorage() {
        try {
            const stored = localStorage.getItem('adminWorkers');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading workers from storage:', error);
            return [];
        }
    }

    // Save events to localStorage
    saveEventsToStorage() {
        try {
            localStorage.setItem('adminEvents', JSON.stringify(this.events));
            console.log('✅ Events saved to localStorage');
        } catch (error) {
            console.error('Error saving events to storage:', error);
        }
    }

    // Save workers to localStorage
    saveWorkersToStorage() {
        try {
            localStorage.setItem('adminWorkers', JSON.stringify(this.workers));
            console.log('✅ Workers saved to localStorage');
        } catch (error) {
            console.error('Error saving workers to storage:', error);
        }
    }

    // Update event with fallback to local storage
    async updateEvent(eventId, eventData) {
        try {
            console.log('🔄 Attempting to update event via API...');
            
            // Try API first
            const token = localStorage.getItem('adminToken');
            const API_BASE_URL = 'https://studentevents-production.up.railway.app/api';
            
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                const updatedEvent = await response.json();
                console.log('✅ Event updated via API');
                return { success: true, event: updatedEvent, method: 'api' };
            } else {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.warn('⚠️ API update failed, using local fallback:', error.message);
            
            // Fallback to local storage
            const eventIndex = this.events.findIndex(e => e.id == eventId);
            if (eventIndex === -1) {
                throw new Error('Event not found');
            }

            // Update local event
            this.events[eventIndex] = {
                ...this.events[eventIndex],
                ...eventData,
                updatedAt: new Date().toISOString()
            };

            this.saveEventsToStorage();
            
            return { 
                success: true, 
                event: this.events[eventIndex], 
                method: 'local',
                warning: 'Changes saved locally. Server unavailable.'
            };
        }
    }

    // Get event by ID
    getEvent(eventId) {
        return this.events.find(e => e.id == eventId);
    }

    // Get all events
    getAllEvents() {
        return this.events;
    }

    // Add or update event
    addOrUpdateEvent(eventData) {
        const existingIndex = this.events.findIndex(e => e.id == eventData.id);
        
        if (existingIndex >= 0) {
            // Update existing event
            this.events[existingIndex] = {
                ...this.events[existingIndex],
                ...eventData,
                updatedAt: new Date().toISOString()
            };
        } else {
            // Add new event
            const newEvent = {
                ...eventData,
                id: eventData.id || `event-${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.events.push(newEvent);
        }

        this.saveEventsToStorage();
        return this.events[existingIndex >= 0 ? existingIndex : this.events.length - 1];
    }
}

// Export for use in admin dashboard
window.AdminDashboardFallback = AdminDashboardFallback;

