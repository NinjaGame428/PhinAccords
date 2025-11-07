#!/bin/bash

# Vercel Deployment Script
echo "🚀 Deploying to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "📤 Deploying..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app is live on Vercel!"

