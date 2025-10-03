// Quick deployment helper script
const fs = require('fs');
const path = require('path');

console.log('🚀 StudentEvents Quick Deploy Helper');
console.log('=====================================\n');

console.log('📋 Step 1: Deploy Backend to Railway');
console.log('1. Go to https://railway.app');
console.log('2. Sign up with GitHub');
console.log('3. Click "New Project" → "Deploy from GitHub repo"');
console.log('4. Set root directory to "backend"');
console.log('5. Add environment variables:');
console.log('   - NODE_ENV=production');
console.log('   - FRONTEND_URL=https://your-site-name.netlify.app');
console.log('6. Copy your Railway URL\n');

console.log('📋 Step 2: Deploy Frontend to Netlify');
console.log('1. Go to https://netlify.com');
console.log('2. Sign up with GitHub');
console.log('3. Click "Add new site" → "Deploy manually"');
console.log('4. Drag and drop your entire project folder');
console.log('5. Copy your Netlify URL\n');

console.log('📋 Step 3: Update Configuration');
console.log('1. Update scripts/config.js with your Railway URL');
console.log('2. Update Railway FRONTEND_URL with your Netlify URL');
console.log('3. Redeploy frontend to Netlify\n');

console.log('🎉 Your website will be live 24/7!');
console.log('\nAlternative: Use Vercel for frontend (easier)');
console.log('1. Go to https://vercel.com');
console.log('2. Import your GitHub repository');
console.log('3. Deploy automatically!');

// Create a simple production config
const productionConfig = `// Production configuration
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

window.CONFIG = CONFIG;`;

fs.writeFileSync('scripts/config-production.js', productionConfig);
console.log('\n✅ Created production config file: scripts/config-production.js');
console.log('   Update the API_BASE_URL with your actual Railway URL');
