# Deploy schema to Supabase using CLI (PowerShell)

Write-Host "🚀 Deploying to Supabase..." -ForegroundColor Cyan

# Check if supabase CLI is installed
try {
    $supabaseVersion = supabase --version 2>$null
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g supabase
}

# Check if project is linked
$isLinked = $false
try {
    supabase status 2>$null | Out-Null
    $isLinked = $true
    Write-Host "✅ Supabase project is linked" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Supabase project not linked" -ForegroundColor Yellow
}

if ($isLinked) {
    Write-Host "📦 Pushing database migrations..." -ForegroundColor Cyan
    supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database migrations pushed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push migrations. Check the error above." -ForegroundColor Red
        Write-Host ""
        Write-Host "📝 Alternative: Run SQL files manually in Supabase Dashboard:" -ForegroundColor Yellow
        Write-Host "   1. Go to https://supabase.com/dashboard" -ForegroundColor Yellow
        Write-Host "   2. Navigate to SQL Editor" -ForegroundColor Yellow
        Write-Host "   3. Run: supabase/schema.sql" -ForegroundColor Yellow
        Write-Host "   4. Run: supabase/user-analytics-tables.sql" -ForegroundColor Yellow
        Write-Host "   5. Run: supabase/migration-complete.sql" -ForegroundColor Yellow
    }
} else {
    Write-Host "📝 Please link your Supabase project first:" -ForegroundColor Yellow
    Write-Host "   supabase link --project-ref your-project-ref" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or run SQL files manually in Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://supabase.com/dashboard" -ForegroundColor Yellow
    Write-Host "   2. Navigate to SQL Editor" -ForegroundColor Yellow
    Write-Host "   3. Run: supabase/schema.sql" -ForegroundColor Yellow
    Write-Host "   4. Run: supabase/user-analytics-tables.sql" -ForegroundColor Yellow
    Write-Host "   5. Run: supabase/migration-complete.sql" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Script completed!" -ForegroundColor Green

