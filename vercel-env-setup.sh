#!/bin/bash
# Script to set up Vercel environment variables
# Run: bash vercel-env-setup.sh

echo "Setting up Vercel environment variables..."

# Neon Database URL
NEON_URL="postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT Secret (generate if needed)
JWT_SECRET="cbe5fcc5b235841273abb6edb2f2345f4665b07167e08e90b029cbbf654f0c47"

echo "Variables to set:"
echo "NEON_DATABASE_URL = $NEON_URL"
echo "DATABASE_URL = $NEON_URL"
echo "JWT_SECRET = $JWT_SECRET"
echo ""
echo "To set these manually in Vercel:"
echo "1. Go to: https://vercel.com/jackmichaels-projects/heavenkeys-chords-finder/settings/environment-variables"
echo "2. Update NEON_DATABASE_URL"
echo "3. Update DATABASE_URL"
echo "4. Update JWT_SECRET"
echo "5. Redeploy"

