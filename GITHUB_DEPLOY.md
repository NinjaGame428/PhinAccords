# GitHub Deployment Instructions

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Repository name: `PhinAccords` (or your preferred name)
4. Description: "Piano worship learning platform"
5. Choose Public or Private
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 2: Push to GitHub

Run these commands in your terminal:

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/PhinAccords.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

Or if you prefer SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/PhinAccords.git
git branch -M main
git push -u origin main
```

## Step 3: Connect to Vercel

After pushing to GitHub:

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your `PhinAccords` repository
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"

Vercel will automatically deploy on every push to main branch!

