// Admin API Connector - Overrides localStorage with API calls
// Add this script AFTER admin-dashboard.js in index.html

(function() {
    'use strict';
    
    // Configuration
    const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'https://studentevents-production.up.railway.app';
    
    console.log('🔌 Admin API Connector loaded');
    console.log('📡 API Base URL:', API_BASE_URL);
    
    // Helper to get auth token
    function getAuthToken() {
        return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    }
    
    // Override the loadMockData method when dashboard is ready
    if (window.adminDashboard) {
        console.log('✅ Connecting admin dashboard to API...');
        
        // Store original method
        const originalLoadMockData = window.adminDashboard.loadMockData;
        
        // Override with API call
        window.adminDashboard.loadMockData = async function() {
            console.log('📡 Loading events from API...');
            try {
                const response = await fetch(`${API_BASE_URL}/api/events`);
                if (!response.ok) throw new Error('Failed to fetch events');
                
                const apiEvents = await response.json();
                console.log(`✅ Loaded ${apiEvents.length} events from API`);
                
                // Transform API events to dashboard format
                this.events = apiEvents.map(event => ({
                    id: event.id,
                    name: event.title,
                    date: event.date,
                    location: event.location,
                    price: event.price,
                    totalTickets: event.totalTickets,
                    soldTickets: event.totalTickets - event.availableTickets,
                    status: event.is_active ? 'upcoming' : 'completed',
                    description: event.description,
                    image: event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
                }));
                
                console.log('✅ Events transformed for dashboard');
                this.updateEventsStatistics();
                this.renderCurrentTab();
                
            } catch (error) {
                console.error('❌ Failed to load from API:', error);
                console.log('⚠️ Falling back to mock data');
                originalLoadMockData.call(this);
            }
        };
        
        // Override deleteEvent to use API
        const originalDeleteEvent = window.adminDashboard.deleteEvent;
        window.adminDashboard.deleteEvent = async function(eventId) {
            if (!confirm('Are you sure you want to delete this event?')) return;
            
            const token = getAuthToken();
            if (!token) {
                alert('Please login first');
                window.location.href = '/admin/login.html';
                return;
            }
            
            try {
                console.log(`🗑️ Deleting event ${eventId} via API...`);
                const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to delete');
                }
                
                console.log('✅ Event deleted from API');
                
                // Remove from local array
                this.events = this.events.filter(e => e.id !== eventId);
                this.showNotification(`Event deleted successfully`, 'success');
                this.renderCurrentTab();
                
            } catch (error) {
                console.error('❌ Delete failed:', error);
                this.showNotification('Failed to delete event: ' + error.message, 'error');
            }
        };
        
        // Reload events from API
        console.log('🔄 Reloading events from API...');
        window.adminDashboard.loadMockData();
        
    } else {
        console.warn('⚠️ adminDashboard not found, will try again...');
        // Try again after dashboard initializes
        setTimeout(() => {
            if (window.adminDashboard) {
                console.log('✅ Dashboard found, initializing API connector...');
                location.reload(); // Reload to apply connector
            }
        }, 1000);
    }
    
    // Add login token handler for admin login page
    window.handleAdminLogin = async function(email, password) {
        try {
            console.log('🔐 Logging in as admin...');
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                throw new Error('Invalid credentials');
            }
            
            const data = await response.json();
            
            if (data.success && data.user.role === 'admin') {
                console.log('✅ Admin login successful');
                localStorage.setItem('adminToken', data.token);
                sessionStorage.setItem('adminAccess', 'true');
                return true;
            } else {
                throw new Error('Not an admin account');
            }
        } catch (error) {
            console.error('❌ Login failed:', error);
            throw error;
        }
    };
    
    console.log('✅ Admin API Connector initialized');
    console.log('📝 To test: Open console and check for API requests');
    
})();

