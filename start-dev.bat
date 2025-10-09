@echo off
echo 🚀 Starting StudentEvents Development Environment...

echo.
echo 📦 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node railway-server.js"

echo.
echo 🌐 Starting Frontend Server...
start "Frontend Server" cmd /k "node start-frontend.js"

echo.
echo ✅ Both servers are starting...
echo.
echo 🎯 Your website will be available at:
echo    Frontend: http://localhost:8000
echo    Backend API: http://localhost:3001
echo    Health Check: http://localhost:3001/health
echo    Events API: http://localhost:3001/api/events
echo.
echo 🔐 Demo Accounts:
echo    Admin: admin@studentevents.com / admin123
echo    Worker: john.worker@studentevents.com / worker123
echo.
echo Press any key to exit...
pause > nul
