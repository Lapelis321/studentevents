// ===== CONFIGURATION FILE =====

// API Configuration
const CONFIG = {
    // Automatically detect environment and use appropriate API URL
    API_BASE_URL: (() => {
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        // Local development (localhost or network IP)
        if (hostname === 'localhost' || hostname === '127.0.0.1' || 
            (hostname.match(/^192\.168\./) || hostname.match(/^10\./) || hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./))) {
            return `http://${hostname}:3001/api`;
        }
        
        // Production - Using a simple API service
        return 'https://studentevents-api.herokuapp.com/api';
    })(),
    
    // Stripe Configuration
    STRIPE_PUBLISHABLE_KEY: (() => {
        const hostname = window.location.hostname;
        
        // Local development - use test keys
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'pk_test_your_test_key_here';
        }
        
        // Production - use live keys
        return 'pk_live_your_live_key_here';
    })(),
    
    // App Configuration
    APP_NAME: 'StudentEvents',
    VERSION: '1.0.0',
    
    // Feature Flags
    FEATURES: {
        REAL_PAYMENTS: window.location.hostname !== 'localhost',
        ANALYTICS: true,
        ERROR_REPORTING: true
    }
};

// Make config available globally
window.CONFIG = CONFIG;

// Export for modules (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
