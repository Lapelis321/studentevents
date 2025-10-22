// =====================================================
// CONFIGURATION
// =====================================================

// API Base URL - Update this for production
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api'
  : 'https://studentevents-production.up.railway.app/api';

// Export configuration
window.CONFIG = {
  API_BASE_URL,
  CURRENCY: 'EUR',
  CURRENCY_SYMBOL: '€'
};

console.log('📡 API configured:', API_BASE_URL);


