# Vercel Environment Variables Setup

## Add Database Connection to Vercel

1. Go to your Vercel project: https://vercel.com/jackmichaels-projects/heavenkeys-chords-finder/settings/environment-variables

2. Add these environment variables:

### Required Variables:

```
NEON_DATABASE_URL=postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

```
DATABASE_URL=postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

```
JWT_SECRET=your-secure-random-string-here-change-this-in-production
```

```
NODE_ENV=production
```

### How to Add:

1. Click "Add New" button
2. Enter variable name: `NEON_DATABASE_URL`
3. Enter variable value: `postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
4. Select environment: All (Production, Preview, Development)
5. Click "Save"
6. Repeat for `DATABASE_URL` with the same value
7. Repeat for `JWT_SECRET` with a secure random string
8. Repeat for `NODE_ENV` with value `production`

### Generate JWT_SECRET:

You can generate a secure random string using:
- Online: https://www.random.org/strings/
- Terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### After Adding Variables:

1. Go to Deployments tab
2. Click "..." on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

Or redeploy via CLI:
```bash
vercel redeploy --prod
```

