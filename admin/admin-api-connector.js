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
            console.log('📡 Loading events from API...');
            try {
                const response = await fetch(`${API_BASE_URL}/api/events`);
                if (!response.ok) throw new Error('API request failed');
                
                const apiEvents = await response.json();
                console.log(`✅ Loaded ${apiEvents.length} events from API`);
                
                // Transform API events to dashboard format
                this.events = apiEvents.map(event => ({
                    id: event.id,
                    name: event.title,
                    date: event.date,
                    location: event.location,
                    price: event.price,
                    totalTickets: event.totalTickets || 100,
                    soldTickets: (event.totalTickets || 100) - (event.availableTickets || 0),
                    status: event.is_active ? 'upcoming' : 'completed',
                    description: event.description || '',
                    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
                }));
                
                console.log('✅ Events transformed:', this.events.length);
                this.updateEventsStatistics();
                this.renderCurrentTab();
                
            } catch (error) {
                console.error('❌ API failed:', error);
                console.log('⚠️ Using fallback data');
                originalLoadMockData();
            }
        };
        
        // Override deleteEvent to use API
        const originalDeleteEvent = window.adminDashboard.deleteEvent.bind(window.adminDashboard);
        
        window.adminDashboard.deleteEvent = async function(eventId) {
            if (!confirm('Are you sure you want to delete this event?')) return;
            
            const token = getAuthToken();
            if (!token) {
                alert('Please login first to delete events');
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
                this.events = this.events.filter(e => e.id !== eventId);
                this.showNotification('Event deleted successfully', 'success');
                this.renderCurrentTab();
                
            } catch (error) {
                console.error('❌ Delete failed:', error);
                this.showNotification('Failed to delete event: ' + error.message, 'error');
            }
        };
        
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


        // Override saveEditedEvent to use API
        const originalSaveEditedEvent = window.adminDashboard.saveEditedEvent.bind(window.adminDashboard);
        
        window.adminDashboard.saveEditedEvent = async function() {
            if (!this.editingEventId) return;
            
            const token = getAuthToken();
            if (!token) {
                alert('Please login first to save changes');
                return;
            }
            
            const event = this.events.find(e => e.id === this.editingEventId);
            if (!event) return;
            
            // Get form data
            const form = document.getElementById('editEventForm');
            const formData = new FormData(form);
            
            // Prepare event data for API
            const eventData = {
                title: formData.get('editEventName') || event.name,
                date: (formData.get('editEventDate') || event.date.substring(0, 16)) + ':00Z',
                location: formData.get('editEventLocation') || event.location,
                price: parseFloat(event.price) || 0,
                currency: 'EUR',
                minAge: 18,
                dressCode: 'Casual',
                description: formData.get('editEventDescription') || event.description || '',
                additionalInfo: '',
                availableTickets: event.totalTickets - event.soldTickets,
                totalTickets: event.totalTickets || 100
            };
            
            try {
                console.log('💾 Updating event via API...', eventData);
                const response = await fetch(+"${API_BASE_URL}/api/events/"+, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': +"Bearer "+
                    },
                    body: JSON.stringify(eventData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Update failed');
                }
                
                const result = await response.json();
                console.log('✅ Event updated on API:', result);
                
                // Update local event
                event.name = eventData.title;
                event.date = eventData.date;
                event.location = eventData.location;
                event.description = eventData.description;
                
                this.closeEditEventModal();
                this.renderEventsTab();
                this.showNotification(+"Event \"\" updated successfully"+, 'success');
                
            } catch (error) {
                console.error('❌ Update failed:', error);
                this.showNotification('Failed to update event: ' + error.message, 'error');
            }
        };
        
        console.log('✅ Edit function connected to API');
