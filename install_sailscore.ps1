# ============================================================
#  SailScore Installer
#  Automates setup of the SailScore racing management app
# ============================================================

$ErrorActionPreference = "Stop"
$HOST.UI.RawUI.WindowTitle = "SailScore Installer"

function Write-Header {
    param($Text)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param($Text)
    Write-Host "  >> $Text" -ForegroundColor Yellow
}

function Write-Success {
    param($Text)
    Write-Host "  [OK] $Text" -ForegroundColor Green
}

function Write-Info {
    param($Text)
    Write-Host "  $Text" -ForegroundColor White
}

function Pause-ForUser {
    param($Message = "Press Enter to continue...")
    Write-Host ""
    Write-Host "  $Message" -ForegroundColor Magenta
    Read-Host
}

function Check-Command {
    param($Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

Clear-Host
Write-Host ""
Write-Host "  ⛵  Welcome to the SailScore Installer  ⛵" -ForegroundColor Cyan
Write-Host ""
Write-Host "  This script will guide you through setting up your own" -ForegroundColor White
Write-Host "  instance of SailScore from scratch." -ForegroundColor White
Write-Host ""
Write-Host "  You will need:" -ForegroundColor White
Write-Host "    - A GitHub account (github.com)" -ForegroundColor Gray
Write-Host "    - A Railway account (railway.app) - free tier is fine" -ForegroundColor Gray
Write-Host "    - A Vercel account (vercel.com) - free tier is fine" -ForegroundColor Gray
Write-Host "    - A SendGrid account (sendgrid.com) - free tier is fine" -ForegroundColor Gray
Write-Host ""
Pause-ForUser "Press Enter to begin..."

# ============================================================
# STEP 1 - Check Prerequisites
# ============================================================
Write-Header "Step 1: Checking Prerequisites"

# Check Git
Write-Step "Checking for Git..."
if (Check-Command "git") {
    $gitVersion = git --version
    Write-Success "Git found: $gitVersion"
} else {
    Write-Host "  [!] Git not found. Opening download page..." -ForegroundColor Red
    Start-Process "https://git-scm.com/download/win"
    Pause-ForUser "Install Git, then press Enter to continue..."
    if (-not (Check-Command "git")) {
        Write-Host "  Git still not found. Please restart this script after installing Git." -ForegroundColor Red
        exit 1
    }
}

# Check Python
Write-Step "Checking for Python..."
if (Check-Command "python") {
    $pyVersion = python --version
    Write-Success "Python found: $pyVersion"
} else {
    Write-Host "  [!] Python not found. Opening download page..." -ForegroundColor Red
    Start-Process "https://www.python.org/downloads/"
    Pause-ForUser "Install Python (check 'Add to PATH'), then press Enter to continue..."
    if (-not (Check-Command "python")) {
        Write-Host "  Python still not found. Please restart this script after installing Python." -ForegroundColor Red
        exit 1
    }
}

# Check Node.js
Write-Step "Checking for Node.js..."
if (Check-Command "node") {
    $nodeVersion = node --version
    Write-Success "Node.js found: $nodeVersion"
} else {
    Write-Host "  [!] Node.js not found. Opening download page..." -ForegroundColor Red
    Start-Process "https://nodejs.org/en/download/"
    Pause-ForUser "Install Node.js, then press Enter to continue..."
    if (-not (Check-Command "node")) {
        Write-Host "  Node.js still not found. Please restart this script after installing Node.js." -ForegroundColor Red
        exit 1
    }
}

Write-Success "All prerequisites met!"

# ============================================================
# STEP 2 - Clone Repository
# ============================================================
Write-Header "Step 2: Clone the SailScore Repository"

Write-Info "You need to be added as a collaborator on the SailScore GitHub repo."
Write-Info "Contact the repo owner to get access before continuing."
Write-Host ""
Write-Info "Once you have access, you need your GitHub Personal Access Token."
Write-Info "To create one:"
Write-Info "  1. Go to https://github.com/settings/tokens"
Write-Info "  2. Click 'Generate new token (classic)'"
Write-Info "  3. Select 'repo' scope"
Write-Info "  4. Copy the token"
Write-Host ""
Start-Process "https://github.com/settings/tokens"
Pause-ForUser "Press Enter once you have your token..."

$githubUser = Read-Host "  Enter your GitHub username"
$githubToken = Read-Host "  Enter your GitHub Personal Access Token"
$repoOwner = Read-Host "  Enter the repo owner's GitHub username (e.g. OCregatta-web)"
$repoName = Read-Host "  Enter the repo name (e.g. sailscore)"

$installDir = Read-Host "  Where do you want to install SailScore? (default: C:\SailScore)"
if ([string]::IsNullOrWhiteSpace($installDir)) { $installDir = "C:\SailScore" }

Write-Step "Cloning repository to $installDir..."
$cloneUrl = "https://${githubToken}@github.com/${repoOwner}/${repoName}.git"
git clone $cloneUrl $installDir

if (-not (Test-Path $installDir)) {
    Write-Host "  Clone failed. Check your credentials and repo name." -ForegroundColor Red
    exit 1
}
Write-Success "Repository cloned to $installDir"

# ============================================================
# STEP 3 - Backend Setup
# ============================================================
Write-Header "Step 3: Setting Up the Backend"

$backendDir = "$installDir\Backend"
Set-Location $backendDir

Write-Step "Creating Python virtual environment..."
python -m venv venv
Write-Success "Virtual environment created"

Write-Step "Installing Python dependencies..."
& "$backendDir\venv\Scripts\pip.exe" install -r requirements.txt
Write-Success "Dependencies installed"

# ============================================================
# STEP 4 - Railway Setup
# ============================================================
Write-Header "Step 4: Set Up Railway (Backend + Database)"

Write-Info "Railway hosts your FastAPI backend and PostgreSQL database."
Write-Info ""
Write-Info "  1. Go to https://railway.app and sign up / log in"
Write-Info "  2. Click 'New Project' → 'Deploy from GitHub repo'"
Write-Info "  3. Connect your GitHub account and select your forked/cloned repo"
Write-Info "  4. Set the root directory to 'Backend'"
Write-Info "  5. Add a PostgreSQL database: click '+ New' → 'Database' → 'PostgreSQL'"
Write-Info "  6. Go to your service Variables tab and add these variables:"
Write-Info ""
Write-Info "     DATABASE_URL  = (Railway auto-fills this from the Postgres service)"
Write-Info "     SECRET_KEY    = (any long random string, e.g. run: python -c ""import secrets; print(secrets.token_hex(32))"")"
Write-Info "     ALLOWED_ORIGINS = https://your-app.vercel.app"
Write-Info ""
Write-Host ""
Start-Process "https://railway.app"
Pause-ForUser "Press Enter once your Railway backend is deployed and running..."

$railwayUrl = Read-Host "  Enter your Railway backend URL (e.g. https://sailscore-production.up.railway.app)"

# ============================================================
# STEP 5 - Frontend Setup
# ============================================================
Write-Header "Step 5: Set Up Vercel (Frontend)"

$frontendDir = "$installDir\frontend"
Set-Location $frontendDir

Write-Step "Installing frontend dependencies..."
npm install
Write-Success "Frontend dependencies installed"

Write-Info ""
Write-Info "Now deploy the frontend to Vercel:"
Write-Info "  1. Go to https://vercel.com and sign up / log in"
Write-Info "  2. Click 'Add New Project' → import your GitHub repo"
Write-Info "  3. Set the root directory to 'frontend'"
Write-Info "  4. Add this environment variable:"
Write-Info "     VITE_API_URL = $railwayUrl"
Write-Info "  5. Deploy!"
Write-Info ""
Start-Process "https://vercel.com"
Pause-ForUser "Press Enter once your Vercel frontend is deployed..."

$vercelUrl = Read-Host "  Enter your Vercel frontend URL (e.g. https://sailscore.vercel.app)"

# ============================================================
# STEP 6 - SendGrid Setup
# ============================================================
Write-Header "Step 6: Set Up Email Notifications (SendGrid)"

Write-Info "SendGrid sends email notifications when boats register."
Write-Info ""
Write-Info "  1. Go to https://sendgrid.com and sign up"
Write-Info "  2. Verify a sender email (Settings → Sender Authentication)"
Write-Info "  3. Create an API key (Settings → API Keys → Full Access)"
Write-Info "  4. Add these to your Railway Variables:"
Write-Info "     SENDGRID_API_KEY    = your API key"
Write-Info "     SENDGRID_FROM_EMAIL = your verified sender email"
Write-Info ""
Start-Process "https://sendgrid.com"
Pause-ForUser "Press Enter once SendGrid is configured in Railway..."

# ============================================================
# STEP 7 - Update ALLOWED_ORIGINS
# ============================================================
Write-Header "Step 7: Finalize Railway Variables"

Write-Info "Go back to Railway and update ALLOWED_ORIGINS to your Vercel URL:"
Write-Info "  ALLOWED_ORIGINS = $vercelUrl"
Write-Info ""
Write-Info "Then redeploy your Railway service."
Write-Info ""
Start-Process "https://railway.app"
Pause-ForUser "Press Enter once done..."

# ============================================================
# STEP 8 - Done!
# ============================================================
Write-Header "Installation Complete!"

Write-Success "SailScore is ready to use!"
Write-Host ""
Write-Info "  Frontend (Vercel): $vercelUrl"
Write-Info "  Backend (Railway): $railwayUrl"
Write-Host ""
Write-Info "  Local backend code: $backendDir"
Write-Info "  Local frontend code: $frontendDir"
Write-Host ""
Write-Info "  To run the backend locally:"
Write-Info "    cd $backendDir"
Write-Info "    venv\Scripts\activate"
Write-Info "    uvicorn main:app --reload"
Write-Host ""
Write-Info "  To run the frontend locally:"
Write-Info "    cd $frontendDir"
Write-Info "    npm run dev"
Write-Host ""
Write-Host "  Good luck on the water! ⛵" -ForegroundColor Cyan
Write-Host ""
Pause-ForUser "Press Enter to exit."
