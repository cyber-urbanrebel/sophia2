# Starts Sophia locally: backend API (port 3001) + frontend (port 5173).
# Run this any time you want to use the app. Leave both windows open while
# you use it; closing them stops the app. Nothing here talks to the
# internet or costs anything — it's all on this machine.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "Starting Sophia backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; .\run_backend.ps1"

Start-Sleep -Seconds 2

Write-Host "Starting Sophia frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\sophia_mobile_web'; npm run dev"

Write-Host ""
Write-Host "Two windows just opened (backend + frontend). Once they're both" -ForegroundColor Green
Write-Host "ready, open http://localhost:5173 in your browser." -ForegroundColor Green
