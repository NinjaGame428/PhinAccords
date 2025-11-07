# Database Sync Guide

This guide explains how to pull all data from your Supabase database.

## Environment Setup

Your `.env.local` file should contain:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zwvappfxasxuzoyxxkyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional, for admin operations)
```

## Method 1: Using Admin Panel (Recommended)

1. **Navigate to Admin Sync Page**:
   - Go to `/admin/sync` (requires admin authentication)
   - Click "Sync Database" button
   - View all data counts and download individual tables or all data

2. **Download Data**:
   - Click download icon on any table card to download that table's data
   - Click "Download All" to get complete database export

## Method 2: Using API Endpoint

**Endpoint**: `GET /api/admin/sync-data`

**Authentication**: Requires admin role

**Example**:
```bash
curl -X GET "http://localhost:3000/api/admin/sync-data" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "counts": {
    "songs": 100,
    "artists": 50,
    "piano_chords": 200,
    ...
  },
  "data": {
    "songs": [...],
    "artists": [...],
    ...
  }
}
```

## Method 3: Using Script (Command Line)

1. **Install dependencies** (if needed):
   ```bash
   npm install tsx --save-dev
   ```

2. **Run the sync script**:
   ```bash
   npx tsx scripts/sync-database.ts
   ```

3. **Output**:
   - Individual JSON files for each table in `database-export/` folder
   - Combined `all-data.json` file
   - `summary.json` with counts and errors

## Method 4: Test Connection

Test your database connection:

```bash
npx tsx scripts/test-connection.ts
```

This will:
- Verify connection to Supabase
- Test all tables
- Show record counts
- Report any errors

## Tables Included

The sync includes all these tables:

1. **songs** - Song catalog
2. **artists** - Artist information
3. **piano_chords** - Piano chord library
4. **resources** - Learning resources
5. **users** - User accounts
6. **favorites** - User favorites
7. **ratings** - Song/resource ratings
8. **song_requests** - Song requests
9. **user_profiles** - User profile data
10. **email_campaigns** - Email campaigns
11. **user_activities** - User activity logs
12. **user_analytics** - Analytics data
13. **user_sessions** - User sessions

## Notes

- **Service Role Key**: Required for admin operations and accessing all data
- **RLS Policies**: Some tables may require proper RLS policies to be accessible
- **Rate Limiting**: Be mindful of Supabase rate limits when syncing large datasets
- **Data Size**: Large datasets may take time to fetch and download

## Troubleshooting

### Connection Errors

If you get connection errors:
1. Verify `.env.local` has correct credentials
2. Check Supabase project is active
3. Verify network connectivity

### Permission Errors

If you get permission errors:
1. Ensure you're using service role key for admin operations
2. Check RLS policies allow access
3. Verify user has admin role

### Missing Tables

If tables are missing:
1. Run the migration script: `supabase/migrations/001_initial_schema.sql`
2. Check table names match exactly
3. Verify tables exist in Supabase dashboard

## Security

⚠️ **Important**: 
- Never commit `.env.local` to version control
- Service role key has full database access - keep it secure
- Sync endpoint requires admin authentication
- Downloaded data may contain sensitive information

