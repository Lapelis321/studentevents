// API Integration for Admin Dashboard
// Add this to the beginning of admin-dashboard.js

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('adminToken');
}

// Set auth token
function setAuthToken(token) {
    localStorage.setItem('adminToken', token);
}

// API base URL from config
const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL.replace('/api', '') : 'https://studentevents-production.up.railway.app';

// API Helper Functions
const AdminAPI = {
    // Get all events
    async getEvents() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events`);
            if (!response.ok) throw new Error('Failed to fetch events');
            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    // Get single event
    async getEvent(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${id}`);
            if (!response.ok) throw new Error('Failed to fetch event');
            return await response.json();
        } catch (error) {
            console.error('Error fetching event:', error);
            throw error;
        }
    },

    // Create event
    async createEvent(eventData) {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create event');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    // Update event
    async updateEvent(id, eventData) {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update event');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    // Delete event
    async deleteEvent(id) {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete event');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    },

    // Get all workers
    async getWorkers() {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/workers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch workers');
            return await response.json();
        } catch (error) {
            console.error('Error fetching workers:', error);
            throw error;
        }
    },

    // Create worker
    async createWorker(workerData) {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/workers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(workerData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create worker');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating worker:', error);
            throw error;
        }
    }
};

// Make API available globally
window.AdminAPI = AdminAPI;

