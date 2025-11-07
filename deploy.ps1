# Vercel Deployment Script for PowerShell
Write-Host "🚀 Deploying PhinAccords to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "📤 Starting deployment..." -ForegroundColor Cyan
Write-Host "Please follow the prompts:" -ForegroundColor Yellow
Write-Host "  - Set up and deploy? → Y" -ForegroundColor Gray
Write-Host "  - Link to existing project? → n" -ForegroundColor Gray
Write-Host "  - Project name? → PhinAccords" -ForegroundColor Gray
Write-Host "  - Directory? → ./" -ForegroundColor Gray
Write-Host "  - Modify settings? → N" -ForegroundColor Gray
Write-Host ""

# Deploy to preview
vercel

Write-Host ""
Write-Host "✅ Preview deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To deploy to production, run: vercel --prod" -ForegroundColor Cyan

