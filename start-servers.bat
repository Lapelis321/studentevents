@echo off
echo Starting Frontend and Backend Servers...
echo.

start "Frontend Server" cmd /k "node start-frontend.js"
timeout /t 2 /nobreak > nul

start "Backend Server" cmd /k "cd backend && node railway-server.js"

echo.
echo ===================================
echo Servers are starting...
echo Frontend: http://localhost:8000
echo Backend:  http://localhost:3001
echo ===================================
echo.
echo Press any key to close this window (servers will keep running)
pause > nul
