@echo off
REM StudentEvents Deployment Script for Windows
REM This script automates the deployment process

echo 🚀 Starting StudentEvents Deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm
    pause
    exit /b 1
)

echo [SUCCESS] Requirements check passed

REM Install CLI tools
echo [INFO] Installing deployment CLI tools...

REM Install Railway CLI
railway --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing Railway CLI...
    npm install -g @railway/cli
)

REM Install Netlify CLI
netlify --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing Netlify CLI...
    npm install -g netlify-cli
)

echo [SUCCESS] CLI tools installed

REM Deploy backend
if "%1"=="frontend" goto :deploy_frontend

echo [INFO] Deploying backend to Railway...
cd backend

echo [INFO] Installing backend dependencies...
npm install

echo [INFO] Building backend...
npm run build

echo [INFO] Deploying to Railway...
railway login
railway init
railway up

cd ..
echo [SUCCESS] Backend deployed successfully!

:deploy_frontend
REM Deploy frontend
if "%1"=="backend" goto :end

echo [INFO] Deploying frontend to Netlify...

echo [INFO] Deploying to Netlify...
netlify login
netlify init
netlify deploy --prod --dir=.

echo [SUCCESS] Frontend deployed successfully!

:end
echo.
echo [SUCCESS] 🎉 Deployment completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Set up your environment variables in Railway dashboard
echo 2. Configure your Supabase database
echo 3. Set up Stripe webhooks
echo 4. Test your deployed application
echo.
echo 📚 For detailed instructions, see DEPLOYMENT.md
pause
