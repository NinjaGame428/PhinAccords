/**
 * Run Database Migration Script
 * PhinAccords - Heavenkeys Ltd
 * 
 * Automatically runs the subscription fields migration
 * Usage: npx tsx scripts/run-migration.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
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

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

async function runMigration() {
  console.log('🚀 Starting database migration...\n')
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
    console.log('🔧 Executing migration...\n')

    // Execute migration using RPC or direct SQL
    // Note: Supabase JS client doesn't support raw SQL execution
    // We'll use the REST API instead
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ sql: migrationSQL }),
    })

    if (!response.ok) {
      // Alternative: Use Supabase Management API or direct PostgreSQL connection
      console.log('⚠️  Direct SQL execution not available via REST API')
      console.log('📋 Please run the migration manually in Supabase Dashboard:\n')
      console.log('1. Go to Supabase Dashboard → SQL Editor')
      console.log('2. Copy contents of: supabase/migrations/002_add_subscription_fields.sql')
      console.log('3. Paste and run\n')
      
      // Check if columns already exist
      const { data: columns, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1)

      if (!checkError && columns) {
        // Try to check if subscription_tier column exists by attempting a query
        const { error: testError } = await supabase
          .rpc('check_subscription_columns')

        if (testError) {
          console.log('✅ Migration needs to be run - columns not found')
          console.log('📝 Migration SQL:\n')
          console.log(migrationSQL)
          console.log('\n')
        } else {
          console.log('✅ Migration appears to have been run already')
        }
      }

      return
    }

    const result = await response.json()
    console.log('✅ Migration executed successfully!\n')
    console.log('📊 Result:', result)

    // Verify migration
    console.log('\n🔍 Verifying migration...\n')
    
    const { data: testData, error: verifyError } = await supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_status')
      .limit(1)

    if (verifyError) {
      console.log('⚠️  Could not verify migration automatically')
      console.log('Please check Supabase Dashboard to confirm columns were added')
    } else {
      console.log('✅ Migration verified! Subscription columns are available\n')
    }

  } catch (error: any) {
    console.error('❌ Error running migration:', error.message)
    console.log('\n📋 Manual Migration Instructions:\n')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Open: supabase/migrations/002_add_subscription_fields.sql')
    console.log('3. Copy and paste the SQL')
    console.log('4. Click Run\n')
    process.exit(1)
  }
}

runMigration()
  .then(() => {
    console.log('\n✨ Migration process completed!')
    console.log('📝 Note: If migration was not executed automatically,')
    console.log('   please run it manually in Supabase Dashboard.\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })

