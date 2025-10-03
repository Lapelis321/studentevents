@echo off
echo 🚀 Deploying StudentEvents to the Cloud!
echo.

echo 📋 Step 1: Deploy Backend to Railway
echo.
echo 1. Go to https://railway.app
echo 2. Sign up with GitHub
echo 3. Click "New Project" → "Deploy from GitHub repo"
echo 4. Select your repository
echo 5. Set the root directory to "backend"
echo 6. Add these environment variables:
echo    - NODE_ENV=production
echo    - FRONTEND_URL=https://your-site-name.netlify.app
echo.
echo 7. Copy your Railway URL (looks like: https://web-production-xxxx.up.railway.app)
echo.

echo 📋 Step 2: Deploy Frontend to Netlify
echo.
echo 1. Go to https://netlify.com
echo 2. Sign up with GitHub
echo 3. Click "Add new site" → "Deploy manually"
echo 4. Drag and drop your entire project folder (not just backend)
echo 5. Wait for deployment
echo 6. Copy your Netlify URL (looks like: https://amazing-site-name.netlify.app)
echo.

echo 📋 Step 3: Update Configuration
echo.
echo 1. Update scripts/config.js with your Railway URL
echo 2. Update Railway environment variables with your Netlify URL
echo.

echo 🎉 Your website will be live 24/7!
echo.
pause
