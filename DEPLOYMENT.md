# Deployment Guide

This guide covers the deployment process for PhinAccords application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project
- Vercel account (for hosting) or your own server

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration (Optional - for direct database access)
POSTGRES_URL=postgres://postgres.your-project-id:password@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
POSTGRES_URL_NON_POOLING=postgres://postgres.your-project-id:password@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_USER=postgres
POSTGRES_HOST=db.your-project-id.supabase.co
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=postgres

# Supabase JWT Secret (Optional - for server-side operations)
SUPABASE_JWT_SECRET=your-jwt-secret

# YouTube API Key (Optional - for video integration)
YOUTUBE_API_KEY=your-youtube-api-key

# Site URL (Required for production)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Database Setup

### 1. Run Migration Scripts

Execute the SQL migration file in your Supabase SQL Editor:

```bash
# The migration file is located at:
supabase/migrations/001_initial_schema.sql
```

### 2. Create Indexes

The migration script includes indexes, but verify they exist:

- `idx_songs_title` on `songs(title)`
- `idx_songs_artist_id` on `songs(artist_id)`
- `idx_songs_genre` on `songs(genre)`
- `idx_artists_name` on `artists(name)`

### 3. Set Up RLS Policies

The migration script includes basic RLS policies. Review and adjust as needed:

- Public read access for songs, artists, resources
- User-specific access for user data
- Admin access for management operations

### 4. Seed Initial Data (Optional)

Create seed data for:
- Default admin user
- Sample songs
- Sample artists
- Sample resources

## Build Process

### Local Build

1. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Build Application**:
   ```bash
   npm run build
   ```

3. **Start Production Server**:
   ```bash
   npm start
   ```

### Vercel Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link Project**:
   ```bash
   vercel link
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   # Add all other required variables
   ```

   Or set them in the Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all required variables for Production, Preview, and Development

5. **Deploy**:
   ```bash
   vercel --prod
   ```

### Manual Server Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Copy files to server**:
   - `.next` folder
   - `public` folder
   - `package.json`
   - `node_modules` (or run `npm install --production` on server)

3. **Set environment variables** on the server

4. **Start the application**:
   ```bash
   npm start
   ```

5. **Use a process manager** (PM2 recommended):
   ```bash
   npm install -g pm2
   pm2 start npm --name "phinaccords" -- start
   pm2 save
   pm2 startup
   ```

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test database connection
- [ ] Verify API routes are working
- [ ] Test authentication flow
- [ ] Check error logging
- [ ] Verify caching is working
- [ ] Test responsive design on mobile/tablet
- [ ] Verify accessibility features
- [ ] Check performance metrics
- [ ] Set up monitoring (optional)

## Troubleshooting

### Build Errors

- **Peer dependency conflicts**: Use `--legacy-peer-deps` flag
- **TypeScript errors**: Check `tsconfig.json` and fix type issues
- **Missing environment variables**: Ensure all required variables are set

### Runtime Errors

- **Database connection issues**: Verify Supabase credentials
- **Authentication errors**: Check JWT secret and session configuration
- **API route errors**: Check server logs and error handling

### Performance Issues

- **Slow page loads**: Check caching configuration
- **Large bundle size**: Review code splitting and dynamic imports
- **Database queries**: Check indexes and query optimization

## Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in analytics for Vercel deployments
- **Sentry**: Error tracking and monitoring
- **Supabase Dashboard**: Database monitoring and logs

### Key Metrics to Monitor

- API response times
- Error rates
- Database query performance
- Cache hit rates
- User activity

## Security Checklist

- [ ] Environment variables are not exposed in client-side code
- [ ] API routes have proper authentication
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS prevention (React auto-escaping)
- [ ] HTTPS is enabled
- [ ] Secure cookies are set
- [ ] RLS policies are active

## Rollback Procedure

If deployment fails:

1. **Vercel**: Use the deployment history to rollback to previous version
2. **Manual**: Restore previous build and restart server
3. **Database**: Restore from backup if schema changes were made

## Support

For issues or questions:
- Check the project documentation
- Review error logs
- Contact the development team
