# Deploy Database Schema to Supabase

This guide will help you push all database tables and migrations to your Supabase project.

## Option 1: Using Supabase Dashboard (Recommended for First Time)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Run the migration scripts in this order:

### Step 1: Run Main Schema
Copy and paste the contents of `schema.sql` into the SQL Editor and execute.

### Step 2: Run User Analytics Tables
Copy and paste the contents of `user-analytics-tables.sql` into the SQL Editor and execute.

### Step 3: Run Complete Migration
Copy and paste the contents of `migration-complete.sql` into the SQL Editor and execute.

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Or run SQL files directly
supabase db execute --file supabase/schema.sql
supabase db execute --file supabase/user-analytics-tables.sql
supabase db execute --file supabase/migration-complete.sql
```

## Option 3: Single Combined Script

You can also run all scripts at once by combining them:

```bash
cat supabase/schema.sql supabase/user-analytics-tables.sql supabase/migration-complete.sql > combined-migration.sql
```

Then run `combined-migration.sql` in the Supabase SQL Editor.

## Verification

After running the migrations, verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see these tables:
- artists
- email_campaigns
- favorites
- piano_chords
- ratings
- resources
- song_requests
- songs
- user_activities
- user_analytics
- user_profiles
- user_sessions
- users

## Important Notes

1. **Backup First**: Always backup your database before running migrations
2. **Test Environment**: Test migrations in a development environment first
3. **Data Migration**: The `songs` table migration adds `artist_id` but keeps `artist` column for backward compatibility. You may need to manually link artists.
4. **RLS Policies**: All tables have Row Level Security enabled. Review policies if you encounter permission issues.

## Troubleshooting

### Error: "relation already exists"
- Some tables may already exist. The scripts use `CREATE TABLE IF NOT EXISTS` to handle this.
- If you get errors, check which tables already exist and comment out those sections.

### Error: "permission denied"
- Ensure you're running as a database superuser or have proper permissions
- Check RLS policies if you can't access data after migration

### Error: "foreign key constraint"
- Make sure parent tables (users, artists) exist before creating child tables
- Run migrations in the correct order

