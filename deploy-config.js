// Deployment Configuration
module.exports = {
  // API Configuration
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.railway.app/api'
    : 'http://localhost:3001/api',
    
  // Stripe Configuration
  STRIPE_PUBLISHABLE_KEY: process.env.NODE_ENV === 'production'
    ? 'pk_live_your_live_stripe_key'
    : 'pk_test_your_test_stripe_key',
    
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:[PASSWORD]@db.vaoyiepnrizvvqokhcuu.supabase.co:5432/postgres',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://vaoyiepnrizvvqokhcuu.supabase.co',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  
  // Server Configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
