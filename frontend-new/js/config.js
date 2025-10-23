// =====================================================
// CONFIGURATION
// =====================================================

// API Base URL - Production Render URL
const API_BASE_URL = 'https://studentevents.onrender.com/api';

// Stripe Configuration
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SDmxFLlgDNr4eSInLD6jaT6wToKZL1SRLnLIRnFLQXw20jOakEI3yA8y54DTIqypfmpJMV5aYTfkLNJTbuIb3tH00uoDVVlsj';

// Export configuration
window.CONFIG = {
  API_BASE_URL,
  STRIPE_PUBLISHABLE_KEY,
  CURRENCY: 'EUR',
  CURRENCY_SYMBOL: '€'
};

console.log('📡 API configured:', API_BASE_URL);


