/**
 * Seed Songs Script
 * Adds sample gospel songs to the database
 * 
 * Usage: npx tsx scripts/seed-songs.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Sample gospel songs
const sampleSongs = [
  {
    title: 'Amazing Grace',
    slug: 'amazing-grace',
    artist: 'John Newton',
    description: 'A timeless hymn of redemption and grace',
    genre: 'Hymn',
    key_signature: 'G',
    difficulty: 'Easy',
    category: 'Worship',
    lyrics: 'Amazing grace, how sweet the sound\nThat saved a wretch like me\nI once was lost, but now am found\nWas blind, but now I see',
    chord_progression: 'G C G D G',
    year: 1779,
  },
  {
    title: 'How Great Thou Art',
    slug: 'how-great-thou-art',
    artist: 'Stuart Hine',
    description: 'A powerful declaration of God\'s greatness',
    genre: 'Hymn',
    key_signature: 'C',
    difficulty: 'Medium',
    category: 'Worship',
    lyrics: 'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made',
    chord_progression: 'C F C G C',
    year: 1949,
  },
  {
    title: 'Great Is Thy Faithfulness',
    slug: 'great-is-thy-faithfulness',
    artist: 'Thomas Chisholm',
    description: 'A hymn celebrating God\'s unwavering faithfulness',
    genre: 'Hymn',
    key_signature: 'Eb',
    difficulty: 'Medium',
    category: 'Worship',
    lyrics: 'Great is Thy faithfulness, O God my Father\nThere is no shadow of turning with Thee',
    chord_progression: 'Eb Ab Eb Bb Eb',
    year: 1923,
  },
  {
    title: 'Blessed Assurance',
    slug: 'blessed-assurance',
    artist: 'Fanny Crosby',
    description: 'A joyful hymn of assurance in Christ',
    genre: 'Hymn',
    key_signature: 'F',
    difficulty: 'Easy',
    category: 'Worship',
    lyrics: 'Blessed assurance, Jesus is mine\nOh, what a foretaste of glory divine',
    chord_progression: 'F Bb F C F',
    year: 1873,
  },
  {
    title: 'It Is Well With My Soul',
    slug: 'it-is-well-with-my-soul',
    artist: 'Horatio Spafford',
    description: 'A hymn of peace and trust in God during trials',
    genre: 'Hymn',
    key_signature: 'G',
    difficulty: 'Medium',
    category: 'Worship',
    lyrics: 'When peace like a river attendeth my way\nWhen sorrows like sea billows roll',
    chord_progression: 'G C G D G',
    year: 1873,
  },
  {
    title: 'In Christ Alone',
    slug: 'in-christ-alone',
    artist: 'Keith Getty & Stuart Townend',
    description: 'A modern hymn about the sufficiency of Christ',
    genre: 'Contemporary',
    key_signature: 'D',
    difficulty: 'Medium',
    category: 'Worship',
    lyrics: 'In Christ alone my hope is found\nHe is my light, my strength, my song',
    chord_progression: 'D G D A D',
    year: 2001,
  },
  {
    title: '10,000 Reasons (Bless the Lord)',
    slug: '10000-reasons-bless-the-lord',
    artist: 'Matt Redman',
    description: 'A contemporary worship song of praise',
    genre: 'Contemporary',
    key_signature: 'C',
    difficulty: 'Easy',
    category: 'Worship',
    lyrics: 'Bless the Lord, O my soul\nO my soul\nWorship His holy name',
    chord_progression: 'C F C G C',
    year: 2011,
  },
  {
    title: 'What a Beautiful Name',
    slug: 'what-a-beautiful-name',
    artist: 'Hillsong Worship',
    description: 'A powerful worship song about the name of Jesus',
    genre: 'Contemporary',
    key_signature: 'D',
    difficulty: 'Medium',
    category: 'Worship',
    lyrics: 'What a beautiful Name it is\nThe Name of Jesus Christ my King',
    chord_progression: 'D G D A D',
    year: 2016,
  },
  {
    title: 'Good Good Father',
    slug: 'good-good-father',
    artist: 'Chris Tomlin',
    description: 'A song about God\'s perfect fatherhood',
    genre: 'Contemporary',
    key_signature: 'G',
    difficulty: 'Easy',
    category: 'Worship',
    lyrics: 'You\'re a good, good Father\nIt\'s who You are, it\'s who You are',
    chord_progression: 'G C G D G',
    year: 2014,
  },
  {
    title: 'Oceans (Where Feet May Fail)',
    slug: 'oceans-where-feet-may-fail',
    artist: 'Hillsong United',
    description: 'A song about trust and faith in God',
    genre: 'Contemporary',
    key_signature: 'Eb',
    difficulty: 'Hard',
    category: 'Worship',
    lyrics: 'You call me out upon the waters\nThe great unknown where feet may fail',
    chord_progression: 'Eb Ab Eb Bb Eb',
    year: 2013,
  },
  {
    title: 'Reckless Love',
    slug: 'reckless-love',
    artist: 'Cory Asbury',
    description: 'A song about God\'s overwhelming, unconditional love',
    genre: 'Contemporary',
    key_signature: 'C',
    difficulty: 'Medium',
    category: 'Worship',
    lyrics: 'Oh, the overwhelming, never-ending, reckless love of God',
    chord_progression: 'C F C G C',
    year: 2017,
  },
  {
    title: 'Way Maker',
    slug: 'way-maker',
    artist: 'Sinach',
    description: 'A powerful declaration of God as our way maker',
    genre: 'Contemporary',
    key_signature: 'A',
    difficulty: 'Medium',
    category: 'Worship',
    lyrics: 'You are here, moving in our midst\nI worship You, I worship You',
    chord_progression: 'A D A E A',
    year: 2015,
  },
  {
    title: 'The Old Rugged Cross',
    slug: 'the-old-rugged-cross',
    artist: 'George Bennard',
    description: 'A classic hymn about the cross of Christ',
    genre: 'Hymn',
    key_signature: 'F',
    difficulty: 'Easy',
    category: 'Worship',
    lyrics: 'On a hill far away stood an old rugged cross\nThe emblem of suffering and shame',
    chord_progression: 'F Bb F C F',
    year: 1913,
  },
  {
    title: 'Great Are You Lord',
    slug: 'great-are-you-lord',
    artist: 'All Sons & Daughters',
    description: 'A worship song declaring God\'s greatness',
    genre: 'Contemporary',
    key_signature: 'G',
    difficulty: 'Easy',
    category: 'Worship',
    lyrics: 'You give life, You are love\nYou bring light to the darkness',
    chord_progression: 'G C G D G',
    year: 2013,
  },
  {
    title: 'Build My Life',
    slug: 'build-my-life',
    artist: 'Housefires',
    description: 'A song about building our lives on Christ',
    genre: 'Contemporary',
    key_signature: 'C',
    difficulty: 'Medium',
    category: 'Worship',
    lyrics: 'Worthy of every song we could ever sing\nWorthy of all the praise we could ever bring',
    chord_progression: 'C F C G C',
    year: 2016,
  },
]

async function seedSongs() {
  console.log('🌱 Starting to seed songs...\n')
  console.log(`📡 Connecting to: ${supabaseUrl}\n`)

  // First, check if songs already exist
  const { count: existingCount } = await supabase
    .from('songs')
    .select('*', { count: 'exact', head: true })

  if (existingCount && existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing songs in database.`)
    console.log('   Skipping seed to avoid duplicates.')
    console.log('   To add these songs anyway, delete existing songs first.\n')
    return
  }

  console.log(`📝 Preparing to insert ${sampleSongs.length} songs...\n`)

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  }

  // Insert songs one by one to handle errors gracefully
  for (const song of sampleSongs) {
    try {
      const { data, error } = await supabase
        .from('songs')
        .insert(song)
        .select()
        .single()

      if (error) {
        console.error(`❌ Failed to insert "${song.title}":`, error.message)
        results.failed++
        results.errors.push(`${song.title}: ${error.message}`)
      } else {
        console.log(`✅ Inserted: ${song.title}`)
        results.success++
      }
    } catch (error: any) {
      console.error(`❌ Exception inserting "${song.title}":`, error.message)
      results.failed++
      results.errors.push(`${song.title}: ${error.message}`)
    }
  }

  console.log('\n✨ Seeding completed!')
  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Successfully inserted: ${results.success}`)
  console.log(`   ❌ Failed: ${results.failed}`)
  console.log(`   📦 Total: ${sampleSongs.length}`)

  if (results.errors.length > 0) {
    console.log(`\n⚠️  Errors:`)
    results.errors.forEach((error) => console.log(`   - ${error}`))
  }

  // Verify the count
  const { count: finalCount } = await supabase
    .from('songs')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📊 Final song count in database: ${finalCount || 0}`)
}

// Run the seed
seedSongs()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })

