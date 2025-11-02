// Test Supabase connection and verify database tables
// Run with: node scripts/test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure .env.local has:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=...');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');

  try {
    // Test 1: Check songs table
    console.log('📋 Test 1: Checking songs table...');
    const { data: songs, error: songsError, count: songsCount } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true });

    if (songsError) {
      console.error('❌ Error accessing songs table:', songsError.message);
      if (songsError.message?.includes('does not exist')) {
        console.log('\n💡 Solution: Run the database schema in Supabase SQL Editor:');
        console.log('   1. Go to https://supabase.com/dashboard');
        console.log('   2. Select your project');
        console.log('   3. Navigate to SQL Editor');
        console.log('   4. Run: supabase/schema.sql');
      }
    } else {
      console.log(`✅ Songs table accessible (${songsCount || 0} songs)`);
    }

    // Test 2: Check artists table
    console.log('\n📋 Test 2: Checking artists table...');
    const { data: artists, error: artistsError, count: artistsCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true });

    if (artistsError) {
      console.error('❌ Error accessing artists table:', artistsError.message);
    } else {
      console.log(`✅ Artists table accessible (${artistsCount || 0} artists)`);
    }

    // Test 3: Fetch actual songs data
    console.log('\n📋 Test 3: Fetching sample songs...');
    const { data: sampleSongs, error: fetchError } = await supabase
      .from('songs')
      .select('id, title, artist, artist_id')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching songs:', fetchError.message);
    } else {
      console.log(`✅ Successfully fetched ${sampleSongs?.length || 0} songs:`);
      sampleSongs?.forEach((song, index) => {
        console.log(`   ${index + 1}. "${song.title}" by ${song.artist || 'Unknown'}`);
      });
    }

    // Test 4: Check RLS policies
    console.log('\n📋 Test 4: Testing Row Level Security...');
    if (songsCount > 0 && sampleSongs && sampleSongs.length > 0) {
      console.log('✅ RLS policies allow reading songs');
    } else if (songsError?.code === '42501' || songsError?.message?.includes('permission')) {
      console.warn('⚠️  RLS policy may be blocking access');
      console.log('\n💡 Solution: Ensure this policy exists in Supabase:');
      console.log('   CREATE POLICY "Anyone can view songs" ON public.songs');
      console.log('     FOR SELECT USING (true);');
    }

    console.log('\n✅ Connection test complete!\n');
    
    // Summary
    console.log('📊 Summary:');
    console.log(`   - Songs: ${songsCount || 0}`);
    console.log(`   - Artists: ${artistsCount || 0}`);
    console.log(`   - Connection: ${songsError ? '❌ Failed' : '✅ Success'}`);
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();

