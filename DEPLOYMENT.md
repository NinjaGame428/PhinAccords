# Deployment Guide

## Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Configure Build Settings:**
   - Root Directory: `babun-main` (if deploying from monorepo)
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd babun-main
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Confirm settings
   - Deploy!

4. **For production:**
   ```bash
   vercel --prod
   ```

## Deploy to Supabase

### Note: Supabase is primarily for backend/database services

Supabase doesn't host Next.js applications directly. However, you can:

### Option 1: Use Supabase for Database/Backend Only

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and API keys

2. **Add Environment Variables:**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Install Supabase Client (if needed):**
   ```bash
   npm install @supabase/supabase-js
   ```

4. **Deploy Frontend to Vercel:**
   - Use Vercel for hosting (as above)
   - Add the same environment variables in Vercel dashboard

### Option 2: Use Supabase Edge Functions (for API routes)

If you need serverless functions, you can use Supabase Edge Functions alongside your Vercel deployment.

## Environment Variables

Add these to Vercel Dashboard → Settings → Environment Variables:

- `NODE_ENV=production`
- Any Supabase keys if using Supabase
- Any other API keys your app needs

## Post-Deployment

1. **Verify Build:**
   - Check Vercel dashboard for build logs
   - Ensure no errors

2. **Test Production URL:**
   - Visit your Vercel deployment URL
   - Test all functionality

3. **Custom Domain (Optional):**
   - Go to Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

## Troubleshooting

- **Build Fails:** Check build logs in Vercel dashboard
- **Environment Variables:** Ensure all required vars are set in Vercel
- **Image Optimization:** Next.js images work automatically on Vercel
- **SCSS Issues:** Already configured in `next.config.js`

