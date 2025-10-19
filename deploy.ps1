# Waroengku Deployment Script
# PowerShell script untuk deploy ke GitHub

Write-Host "🚀 Waroengku Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Check if already initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Get commit message
Write-Host ""
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# Stage all changes
Write-Host ""
Write-Host "📝 Staging changes..." -ForegroundColor Yellow
git add .

# Show status
Write-Host ""
Write-Host "📊 Git Status:" -ForegroundColor Cyan
git status --short

# Commit
Write-Host ""
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "$commitMessage"

# Check if remote exists
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host ""
    Write-Host "⚠️  No remote repository configured!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please create a GitHub repository and run:" -ForegroundColor Cyan
    Write-Host "git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git" -ForegroundColor White
    Write-Host "git branch -M main" -ForegroundColor White
    Write-Host "git push -u origin main" -ForegroundColor White
    Write-Host ""
    
    $addRemote = Read-Host "Do you want to add remote now? (y/n)"
    if ($addRemote -eq "y") {
        $repoUrl = Read-Host "Enter your GitHub repository URL"
        git remote add origin $repoUrl
        git branch -M main
        Write-Host "✅ Remote added" -ForegroundColor Green
    } else {
        Write-Host "⏭️  Skipping remote setup" -ForegroundColor Yellow
        exit 0
    }
}

# Push to GitHub
Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully deployed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to Easypanel dashboard" -ForegroundColor White
    Write-Host "2. Create new service from GitHub" -ForegroundColor White
    Write-Host "3. Select your repository" -ForegroundColor White
    Write-Host "4. Easypanel will auto-detect Dockerfile" -ForegroundColor White
    Write-Host "5. Deploy!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host "Please check your credentials and try again" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
