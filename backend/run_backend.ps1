# Sophia backend launcher (Windows PowerShell).
# Creates a venv on first run, installs dependencies, copies .env.example to
# .env if missing, then starts the API on http://localhost:3001.
# No API keys are required to run — see .env.example for what each optional
# key upgrades.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
}

$activate = ".venv\Scripts\Activate.ps1"
& $activate

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example (all AI keys optional — see comments inside)."
}

pip install -r requirements.txt --quiet

uvicorn app.main:app --reload --port 3001
