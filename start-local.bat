@echo off
echo ========================================
echo Starting StudentEvents Locally
echo ========================================
echo.
echo Starting Backend Server (port 3001)...
start "Backend Server" cmd /k "cd backend && node railway-server.js"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Server (port 8000)...
start "Frontend Server" cmd /k "npx -y http-server -p 8000"
timeout /t 5 /nobreak >nul
echo.
echo ========================================
echo Servers Started!
echo ========================================
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:8000
echo.
echo Opening browser...
start http://localhost:8000
echo.
echo Two command windows have opened:
echo   1. Backend Server (keep running)
echo   2. Frontend Server (keep running)
echo.
echo Close those windows to stop the servers.
echo.
pause

