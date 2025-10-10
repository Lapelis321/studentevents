@echo off
echo ========================================
echo Starting StudentEvents Locally
echo ========================================
echo.
echo Starting Backend Server (port 3001)...
start "Backend Server" cmd /k "cd backend && node railway-server.js"
timeout /t 2 /nobreak >nul
echo.
echo Starting Frontend Server (port 8000)...
start "Frontend Server" cmd /k "python -m http.server 8000"
timeout /t 2 /nobreak >nul
echo.
echo ========================================
echo Servers Started!
echo ========================================
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:8000
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:8000
echo.
echo Press any key to close this window...
pause >nul

