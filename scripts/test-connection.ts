/**
 * Test Database Connection Script
 * Verifies connection to Supabase database
 * 
 * Usage: npx tsx scripts/test-connection.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

console.log('🔍 Testing Supabase connection...\n')
console.log(`📡 URL: ${supabaseUrl}`)
console.log(`🔑 Key: ${supabaseAnonKey.substring(0, 20)}...\n`)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test connection by fetching from a table
    const { data, error, count } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Connection failed:', error.message)
      console.error('   Code:', error.code)
      console.error('   Details:', error.details)
      process.exit(1)
    }

    console.log('✅ Connection successful!')
    console.log(`📊 Songs table accessible (${count || 0} records)\n`)

    // Test all tables
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

    console.log('📋 Testing all tables...\n')
    const results: Record<string, { success: boolean; count: number; error?: string }> = {}

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (error) {
          results[table] = { success: false, count: 0, error: error.message }
          console.log(`   ❌ ${table}: ${error.message}`)
        } else {
          results[table] = { success: true, count: count || 0 }
          console.log(`   ✅ ${table}: ${count || 0} records`)
        }
      } catch (err: any) {
        results[table] = { success: false, count: 0, error: err.message }
        console.log(`   ❌ ${table}: ${err.message}`)
      }
    }

    const successful = Object.values(results).filter((r) => r.success).length
    const failed = Object.values(results).filter((r) => !r.success).length
    const totalRecords = Object.values(results).reduce((sum, r) => sum + r.count, 0)

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Successful: ${successful}/${tables.length}`)
    console.log(`   ❌ Failed: ${failed}/${tables.length}`)
    console.log(`   📦 Total records: ${totalRecords}`)

    if (failed > 0) {
      console.log(`\n⚠️  Some tables are not accessible. This might be normal if:`)
      console.log(`   - Tables haven't been created yet`)
      console.log(`   - RLS policies are blocking access`)
      console.log(`   - You need service role key for admin operations`)
    }

    console.log('\n✅ Connection test completed!')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message)
    process.exit(1)
  }
}

testConnection()

