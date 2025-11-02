#!/bin/bash

# Deploy schema to Supabase using CLI

echo "🚀 Deploying to Supabase..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Link to project (requires project ref)
if [ -z "$SUPABASE_PROJECT_REF" ]; then
    echo "⚠️  SUPABASE_PROJECT_REF not set. Please set it or run:"
    echo "   supabase link --project-ref your-project-ref"
    echo ""
    echo "📋 Deploying using SQL files directly..."
    
    # Alternative: Use db push if linked
    if supabase status &> /dev/null; then
        echo "✅ Supabase project is linked. Pushing migrations..."
        supabase db push
    else
        echo "📝 Please run the SQL files manually in Supabase Dashboard:"
        echo "   1. Go to https://supabase.com/dashboard"
        echo "   2. Navigate to SQL Editor"
        echo "   3. Run: supabase/schema.sql"
        echo "   4. Run: supabase/user-analytics-tables.sql"
        echo "   5. Run: supabase/migration-complete.sql"
    fi
else
    echo "🔗 Linking to Supabase project: $SUPABASE_PROJECT_REF"
    supabase link --project-ref "$SUPABASE_PROJECT_REF"
    
    echo "📦 Pushing database migrations..."
    supabase db push
fi

echo "✅ Deployment complete!"

