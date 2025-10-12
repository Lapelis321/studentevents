// Admin API Connector - Connects dashboard to Railway API
// Load this AFTER admin-dashboard.js

(function() {
    'use strict';
    
    const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'https://studentevents-production.up.railway.app';
    
    console.log('🔌 Admin API Connector initializing...');
    console.log('📡 API Base URL:', API_BASE_URL);
    
    function getAuthToken() {
        return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    }
    
    // Wait for dashboard to be ready
    function initConnector() {
        if (!window.adminDashboard) {
            console.log('⏳ Waiting for dashboard to load...');
            setTimeout(initConnector, 100);
            return;
        }
        
        console.log('✅ Dashboard found, connecting to API...');
        
        // Override loadMockData to load from API
        const originalLoadMockData = window.adminDashboard.loadMockData.bind(window.adminDashboard);
        
        window.adminDashboard.loadMockData = async function() {
            // ALWAYS try to load from API first to get the latest data
            console.log('📡 Loading events from API...');
            try {
                const response = await fetch(`${API_BASE_URL}/api/events`);
                if (!response.ok) throw new Error('API request failed');
                
                const apiEvents = await response.json();
                console.log(`✅ Loaded ${apiEvents.length} events from API`);
                
                // Transform API events to dashboard format
                this.events = apiEvents.map(event => {
                    // Determine status: preserve backend status, or calculate if not provided
                    let status = 'active';
                    if (event.status === 'completed-shown') {
                        status = 'completed-shown';
                    } else if (event.status === 'completed') {
                        status = 'completed';
                    } else if (event.status === 'cancelled') {
                        status = 'cancelled';
                    } else if (event.status === 'sold-out' || event.availableTickets === 0 || event.availableTickets === '0') {
                        status = 'sold-out';
                    } else if (!event.is_active) {
                        status = 'completed';
                    }
                    
                    return {
                        id: event.id,
                        name: event.title,
                        date: event.date,
                        location: event.location,
                        price: event.price,
                        totalTickets: event.totalTickets || 100,
                        availableTickets: event.availableTickets || 0,
                        soldTickets: (event.totalTickets || 100) - (event.availableTickets || 0),
                        status: status,
                        description: event.description || '',
                        image: event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
                        minAge: event.min_age,
                        dressCode: event.dress_code
                    };
                });
                
                console.log('✅ Events transformed:', this.events.length);
                
                // IMPORTANT: Save to localStorage immediately so it persists!
                this.saveEventsToStorage();
                
                // CRITICAL: Ensure events stay in memory!
                console.log('✅ Events array in memory:', this.events.length, 'events');
                
                this.updateEventsStatistics();
                this.renderCurrentTab();
                
                // Double-check: Log events after render to ensure they persist
                setTimeout(() => {
                    console.log('🔍 Post-render check - events in memory:', window.adminDashboard.events.length);
                }, 100);
                
            } catch (error) {
                console.error('❌ API failed:', error);
                console.log('⚠️ Using fallback data from localStorage');
                await originalLoadMockData();
            }
        };
        
        // Override deleteEvent to use API
        const originalDeleteEvent = window.adminDashboard.deleteEvent.bind(window.adminDashboard);
        
        window.adminDashboard.deleteEvent = async function(eventId) {
            if (!confirm('Are you sure you want to delete this event?')) return;
            
            const token = getAuthToken();
            if (!token) {
                console.log('⚠️ No auth token, performing local-only delete');
                // Perform local delete without API call
                this.events = this.events.filter(e => e.id != eventId);  // Use loose comparison
                this.saveEventsToStorage();
                this.renderEventsTab();
                if (this.showNotification) {
                    this.showNotification('Event deleted locally', 'success');
                } else {
                    alert('Event deleted successfully');
                }
                return;
            }
            
            try {
                console.log(`🗑️ Deleting event ${eventId}...`);
                const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!response.ok) throw new Error('Delete failed');
                
                console.log('✅ Event deleted from API');
                this.events = this.events.filter(e => e.id != eventId);  // Use loose comparison
                this.saveEventsToStorage();  // Save to localStorage
                console.log('✅ Event removed from localStorage');
                
                this.renderEventsTab();
                if (this.showNotification) {
                    this.showNotification('Event deleted successfully', 'success');
                } else {
                    alert('Event deleted successfully');
                }
                
            } catch (error) {
                console.error('❌ Delete failed:', error);
                // Fall back to local delete if API fails
                console.log('⚠️ API delete failed, performing local-only delete...');
                this.events = this.events.filter(e => e.id != eventId);  // Use loose comparison
                this.saveEventsToStorage();
                console.log('✅ Event removed locally (API unavailable)');
                
                this.renderEventsTab();
                if (this.showNotification) {
                    this.showNotification('Event deleted locally (server unavailable)', 'warning');
                } else {
                    alert('Event deleted locally');
                }
            }
        };
        
        // Override saveEditedEvent to use API
        const originalSaveEditedEvent = window.adminDashboard.saveEditedEvent.bind(window.adminDashboard);
        
        window.adminDashboard.saveEditedEvent = async function() {
            if (!this.editingEventId) return;
            
            const token = getAuthToken();
            if (!token) {
                console.log('⚠️ No auth token, falling back to local-only save');
                // Fall back to original function for local-only save
                return originalSaveEditedEvent.call(this);
            }
            
            const event = this.events.find(e => e.id == this.editingEventId);  // Use loose comparison
            if (!event) {
                console.error('Event not found:', this.editingEventId);
                return;
            }
            
            // Get form data
            const form = document.getElementById('editEventForm');
            const formData = new FormData(form);
            
            // Get price and totalTickets from form
            const price = parseFloat(document.getElementById('editEventPrice')?.value) || event.price || 0;
            const totalTickets = parseInt(document.getElementById('editEventTotalTickets')?.value) || event.totalTickets || 100;
            const minAge = document.getElementById('editEventMinAge')?.value;
            const dressCode = document.getElementById('editEventDressCode')?.value;
            const status = formData.get('editEventStatus');
            const ticketsAvailableDate = document.getElementById('editEventTicketsAvailableDate')?.value;
            
            // If status is "sold-out", set availableTickets to 0
            const availableTickets = status === 'sold-out' ? 0 : totalTickets - (event.soldTickets || 0);
            
            // Prepare event data for API
            const eventData = {
                title: formData.get('editEventName') || event.name,
                date: (formData.get('editEventDate') || event.date.substring(0, 16)) + ':00Z',
                location: formData.get('editEventLocation') || event.location,
                price: price,
                currency: 'EUR',
                minAge: minAge ? parseInt(minAge) : null,
                dressCode: dressCode || 'No specific dress code',
                description: formData.get('editEventDescription') || event.description || '',
                additionalInfo: formData.get('editEventImage') || event.image || '',
                availableTickets: availableTickets,
                totalTickets: totalTickets,
                is_active: status === 'upcoming' || status === 'active',
                status: status,
                ticketsAvailableDate: ticketsAvailableDate || null
            };
            
            try {
                console.log('💾 Updating event via API...', eventData);
                const response = await fetch(`${API_BASE_URL}/api/events/${this.editingEventId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(eventData)
                });
                
                if (!response.ok) {
                    const error = await response.json().catch(() => ({ error: 'Update failed' }));
                    throw new Error(error.error || 'Update failed');
                }
                
                const result = await response.json();
                console.log('✅ Event updated on API:', result);
                
                // Update local event with ALL fields
                event.name = eventData.title;
                event.date = eventData.date;
                event.location = eventData.location;
                event.description = eventData.description;
                event.image = eventData.additionalInfo;
                event.price = eventData.price;
                event.totalTickets = eventData.totalTickets;
                event.availableTickets = eventData.availableTickets;
                event.minAge = eventData.minAge;
                event.dressCode = eventData.dressCode;
                event.status = status;
                
                // CRITICAL: Save to localStorage!
                this.saveEventsToStorage();
                console.log('✅ Event saved to localStorage');
                
                this.closeEditEventModal();
                this.renderEventsTab();
                
                // Use showNotification method if available, otherwise alert
                if (this.showNotification) {
                    this.showNotification(`Event "${eventData.title}" updated successfully`, 'success');
                } else {
                    alert(`Event "${eventData.title}" updated successfully`);
                }
                
            } catch (error) {
                console.error('❌ Update failed:', error);
                // Try to fall back to local-only save if API fails
                console.log('⚠️ API update failed, attempting local-only save...');
                try {
                    // Update local event
                    event.name = formData.get('editEventName') || event.name;
                    event.date = formData.get('editEventDate') || event.date;
                    event.location = formData.get('editEventLocation') || event.location;
                    event.description = formData.get('editEventDescription') || event.description;
                    event.image = formData.get('editEventImage') || event.image;
                    event.price = price;
                    event.totalTickets = totalTickets;
                    event.availableTickets = availableTickets;
                    event.minAge = minAge ? parseInt(minAge) : null;
                    event.dressCode = dressCode || 'No specific dress code';
                    event.status = status || event.status;
                    
                    // Save to localStorage
                    this.saveEventsToStorage();
                    console.log('✅ Event saved locally (API unavailable)');
                    
                    this.closeEditEventModal();
                    this.renderEventsTab();
                    
                    if (this.showNotification) {
                        this.showNotification(`Event "${event.name}" updated locally (server unavailable)`, 'warning');
                    } else {
                        alert(`Event "${event.name}" updated locally`);
                    }
                } catch (localError) {
                    console.error('❌ Local save also failed:', localError);
                    if (this.showNotification) {
                        this.showNotification('Failed to update event: ' + error.message, 'error');
                    } else {
                        alert('Failed to update event: ' + error.message);
                    }
                }
            }
        };
        
        console.log('✅ Edit function connected to API');
        
        // Trigger initial load from API
        console.log('🔄 Loading events from API...');
        window.adminDashboard.loadMockData();
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initConnector);
    } else {
        initConnector();
    }
    
    console.log('✅ API Connector loaded');
    
})();
