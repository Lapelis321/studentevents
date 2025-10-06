@echo off
echo 🚀 Deploying to Railway...
echo.

cd backend
echo 📦 Installing dependencies...
call npm install

echo.
echo 🚀 Deploying to Railway...
call railway up

echo.
echo ✅ Deployment complete!
echo.
echo 🌐 Your API should be available at:
echo https://afterstate-events.up.railway.app/api/health
echo.
pause
