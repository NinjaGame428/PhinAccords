/**
 * Database Sync Script
 * Fetches all data from Supabase database and saves to JSON files
 * 
 * Usage: npx tsx scripts/sync-database.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// Use service role key if available, otherwise use anon key
const supabase = createClient(
  supabaseUrl,
  serviceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

const tables = [
  'songs',
  'artists',
  'piano_chords',
  'resources',
  'users',
  'favorites',
  'ratings',
  'song_requests',
  'user_profiles',
  'email_campaigns',
  'user_activities',
  'user_analytics',
  'user_sessions',
]

async function fetchAllData() {
  console.log('🔄 Starting database sync...\n')
  console.log(`📡 Connecting to: ${supabaseUrl}\n`)

  const outputDir = path.join(process.cwd(), 'database-export')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const results: Record<string, any> = {}
  const errors: Record<string, string> = {}

  for (const table of tables) {
    try {
      console.log(`📥 Fetching ${table}...`)
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })

      if (error) {
        console.error(`❌ Error fetching ${table}:`, error.message)
        errors[table] = error.message
        results[table] = []
      } else {
        console.log(`✅ Fetched ${count || data?.length || 0} records from ${table}`)
        results[table] = data || []
      }
    } catch (error: any) {
      console.error(`❌ Exception fetching ${table}:`, error.message)
      errors[table] = error.message
      results[table] = []
    }
  }

  // Save individual table files
  console.log('\n💾 Saving individual table files...')
  for (const [table, data] of Object.entries(results)) {
    const filePath = path.join(outputDir, `${table}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    console.log(`   ✓ Saved ${table}.json (${data.length} records)`)
  }

  // Save combined file
  console.log('\n💾 Saving combined file...')
  const combinedData = {
    timestamp: new Date().toISOString(),
    counts: Object.fromEntries(
      Object.entries(results).map(([table, data]) => [table, data.length])
    ),
    data: results,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }

  const combinedPath = path.join(outputDir, 'all-data.json')
  fs.writeFileSync(combinedPath, JSON.stringify(combinedData, null, 2), 'utf-8')
  console.log(`   ✓ Saved all-data.json`)

  // Save summary
  const summary = {
    timestamp: new Date().toISOString(),
    total_tables: tables.length,
    successful_tables: tables.length - Object.keys(errors).length,
    failed_tables: Object.keys(errors).length,
    counts: Object.fromEntries(
      Object.entries(results).map(([table, data]) => [table, data.length])
    ),
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }

  const summaryPath = path.join(outputDir, 'summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')
  console.log(`   ✓ Saved summary.json`)

  console.log('\n✨ Database sync completed!')
  console.log(`📁 Files saved to: ${outputDir}`)
  console.log(`\n📊 Summary:`)
  console.log(`   Total tables: ${tables.length}`)
  console.log(`   Successful: ${tables.length - Object.keys(errors).length}`)
  console.log(`   Failed: ${Object.keys(errors).length}`)
  console.log(`   Total records: ${Object.values(results).reduce((sum, data) => sum + data.length, 0)}`)

  if (Object.keys(errors).length > 0) {
    console.log(`\n⚠️  Errors:`)
    for (const [table, error] of Object.entries(errors)) {
      console.log(`   ${table}: ${error}`)
    }
  }
}

// Run the sync
fetchAllData()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })

