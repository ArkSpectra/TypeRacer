Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "     Menjalankan TypeRacer Multiplayer Arena" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

$env:Path = "C:\Program Files\nodejs;" + $env:Path

Write-Host "Menjalankan Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; `$env:Path = 'C:\Program Files\nodejs;' + `$env:Path; npm.cmd run dev"

Start-Sleep -Seconds 2

Write-Host "Menjalankan Frontend Client (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; `$env:Path = 'C:\Program Files\nodejs;' + `$env:Path; npm.cmd run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Aplikasi siap! Buka browser di: http://localhost:5173" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
