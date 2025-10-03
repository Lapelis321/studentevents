// Production configuration
const CONFIG = {
    API_BASE_URL: 'https://your-railway-url.up.railway.app/api',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_your_test_key_here',
    APP_NAME: 'StudentEvents',
    VERSION: '1.0.0',
    FEATURES: {
        REAL_PAYMENTS: false,
        ANALYTICS: true,
        ERROR_REPORTING: true
    }
};

window.CONFIG = CONFIG;