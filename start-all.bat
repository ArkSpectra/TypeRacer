@echo off
echo ===================================================
echo     Menjalankan TypeRacer Multiplayer Arena
echo ===================================================

echo Menjalankan Backend Server (Port 5000)...
start "TypeRacer Server" cmd /k "cd server && npm run dev"

timeout /t 2 /nobreak >nul

echo Menjalankan Frontend Client (Port 5173)...
start "TypeRacer Client" cmd /k "cd client && npm run dev"

echo.
echo ===================================================
echo   Aplikasi siap! Buka browser di:
echo   http://localhost:5173
echo ===================================================
