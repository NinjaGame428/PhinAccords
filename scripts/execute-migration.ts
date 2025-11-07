/**
 * Execute Database Migration Script
 * PhinAccords - Heavenkeys Ltd
 * 
 * This script uses Supabase REST API to execute SQL migrations
 * Usage: npx tsx scripts/execute-migration.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import * as fs from 'fs'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

async function executeMigration() {
  console.log('🚀 Executing database migration...\n')
  console.log(`📡 Connecting to: ${supabaseUrl}\n`)

  try {
    // Read migration file
    const migrationPath = resolve(process.cwd(), 'supabase/migrations/002_add_subscription_fields.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`)
      process.exit(1)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
    
    console.log('📄 Migration file loaded\n')
    console.log('🔧 Executing migration via Supabase Management API...\n')

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

    // Execute each statement using Supabase REST API
    // Note: Supabase doesn't have a direct SQL execution endpoint via REST
    // We'll use the PostgREST API for table operations, but for DDL we need to use the dashboard
    
    console.log('⚠️  Supabase REST API does not support direct SQL execution for DDL statements')
    console.log('📋 Please run the migration manually in Supabase Dashboard:\n')
    console.log('1. Go to: https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Click New Query')
    console.log('5. Copy and paste the following SQL:\n')
    console.log('─'.repeat(80))
    console.log(migrationSQL)
    console.log('─'.repeat(80))
    console.log('\n6. Click Run (or press Ctrl+Enter / Cmd+Enter)\n')

    // Try to verify if migration was already run
    console.log('🔍 Checking if migration was already run...\n')
    
    const checkUrl = `${supabaseUrl}/rest/v1/user_profiles?select=subscription_tier&limit=1`
    const checkResponse = await fetch(checkUrl, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    })

    if (checkResponse.ok) {
      const data = await checkResponse.json()
      if (data && data.length > 0 && 'subscription_tier' in data[0]) {
        console.log('✅ Migration appears to have been run already!')
        console.log('   The subscription_tier column exists in user_profiles table.\n')
        return
      }
    }

    // If we get here, migration hasn't been run
    console.log('❌ Migration has not been run yet.')
    console.log('   Please follow the instructions above to run it manually.\n')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.log('\n📋 Manual Migration Instructions:\n')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Open: supabase/migrations/002_add_subscription_fields.sql')
    console.log('3. Copy and paste the SQL')
    console.log('4. Click Run\n')
    process.exit(1)
  }
}

executeMigration()
  .then(() => {
    console.log('✨ Migration check completed!')
    console.log('📝 If migration was not run, please follow the instructions above.\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration check failed:', error)
    process.exit(1)
  })

