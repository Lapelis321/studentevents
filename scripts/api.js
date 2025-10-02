// ===== API SERVICE =====

class APIService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            
            // Show user-friendly error message
            if (error.message.includes('Failed to fetch')) {
                EventTicketingApp.showNotification('Unable to connect to server. Please check your internet connection.', 'error');
            } else {
                EventTicketingApp.showNotification(error.message || 'Something went wrong. Please try again.', 'error');
            }
            
            throw error;
        }
    }

    // Authentication endpoints
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    async logout() {
        this.setToken(null);
        return { success: true };
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    // Event endpoints
    async getEvents() {
        return this.request('/events');
    }

    async getEvent(id) {
        return this.request(`/events/${id}`);
    }

    async createEvent(eventData) {
        return this.request('/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }

    async updateEvent(id, eventData) {
        return this.request(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });
    }

    async deleteEvent(id) {
        return this.request(`/events/${id}`, {
            method: 'DELETE'
        });
    }

    // Ticket endpoints
    async purchaseTicket(ticketData) {
        return this.request('/tickets/purchase', {
            method: 'POST',
            body: JSON.stringify(ticketData)
        });
    }

    async confirmTicket(confirmationData) {
        return this.request('/tickets/confirm', {
            method: 'POST',
            body: JSON.stringify(confirmationData)
        });
    }

    async getMyTickets() {
        return this.request('/tickets/my-tickets');
    }

    async getTicket(id) {
        return this.request(`/tickets/${id}`);
    }

    async downloadTicket(id) {
        const response = await fetch(`${this.baseURL}/tickets/${id}/download`, {
            headers: this.getHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to download ticket');
        }
        
        return response.blob();
    }

    // Worker endpoints (for admin/worker users)
    async validateTicket(ticketId) {
        return this.request('/tickets/validate', {
            method: 'POST',
            body: JSON.stringify({ ticketId })
        });
    }

    async getWorkerEvents() {
        return this.request('/workers/my-events');
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Create global API service instance
window.api = new APIService();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}
