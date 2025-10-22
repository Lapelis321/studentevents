// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const Utils = {
  /**
   * Make API request
   */
  async apiRequest(endpoint, options = {}) {
    const url = `${window.CONFIG.API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },
  
  /**
   * Format date
   */
  formatDate(dateString, options = {}) {
    const defaultOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('en-US', {
      ...defaultOptions,
      ...options
    });
  },
  
  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },
  
  /**
   * Show loading state
   */
  showLoading(element) {
    element.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    `;
  },
  
  /**
   * Show error state
   */
  showError(element, message) {
    element.innerHTML = `
      <div class="error-state" style="text-align: center; padding: 40px 20px;">
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #EF4444; margin-bottom: 16px;"></i>
        <h3 style="margin-bottom: 12px;">Error</h3>
        <p style="color: #6B7280;">${message}</p>
      </div>
    `;
  },
  
  /**
   * Validate email
   */
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  /**
   * Validate phone
   */
  validatePhone(phone) {
    return /^[\d\s\-\+\(\)]{8,}$/.test(phone);
  },
  
  /**
   * Store auth token
   */
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  },
  
  /**
   * Get auth token
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  },
  
  /**
   * Remove auth token
   */
  removeAuthToken() {
    localStorage.removeItem('authToken');
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getAuthToken();
  },
  
  /**
   * Logout user
   */
  logout() {
    this.removeAuthToken();
    window.location.href = '/';
  },
  
  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Export for use in other scripts
window.Utils = Utils;

// =====================================================
// GLOBAL HELPER FUNCTIONS FOR BACKWARD COMPATIBILITY
// =====================================================

// API Request Helper
async function fetchAPI(endpoint, method = 'GET', data = null, isFormData = false) {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('workerToken') || localStorage.getItem('authToken');
  const url = `${window.CONFIG.API_BASE_URL}${endpoint}`;

  const options = {
    method,
    headers: {}
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData (for file uploads) vs JSON
  if (data) {
    if (isFormData && data instanceof FormData) {
      options.body = data;
      // Don't set Content-Type header for FormData - browser sets it automatically with boundary
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return await response.json();
}

// Loading State Helpers
function showLoading() {
  // Create or show global loading indicator
  let loader = document.getElementById('globalLoader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    loader.innerHTML = `
      <div style="text-align: center;">
        <div class="spinner" style="
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 12px;
        "></div>
        <p style="color: #666; font-weight: 600;">Loading...</p>
      </div>
    `;
    document.body.appendChild(loader);
    
    // Add spin animation if not exists
    if (!document.getElementById('spinnerStyles')) {
      const spinStyle = document.createElement('style');
      spinStyle.id = 'spinnerStyles';
      spinStyle.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(spinStyle);
    }
  } else {
    loader.style.display = 'flex';
  }
}

function hideLoading() {
  const loader = document.getElementById('globalLoader');
  if (loader) {
    loader.style.display = 'none';
  }
}

// Notification Helper
function showNotification(message, type = 'info') {
  Utils.showNotification(message, type);
}


