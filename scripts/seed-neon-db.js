// Seed Neon database with initial data
// Run with: node scripts/seed-neon-db.js

const postgres = require('postgres');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_LivS9pIUw2xZ@ep-ancient-cell-a4zoiv9g-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Sample artists
const sampleArtists = [
  { name: 'Kirk Franklin', bio: 'Grammy-winning gospel artist', website: 'https://kirkfranklin.com' },
  { name: 'CeCe Winans', bio: 'Contemporary Christian music artist', website: 'https://cecewinans.com' },
  { name: 'Fred Hammond', bio: 'Gospel singer and songwriter', website: 'https://fredhammond.com' },
  { name: 'Yolanda Adams', bio: 'Gospel singer, actress, and former radio host', website: 'https://yolandaadams.com' },
  { name: 'Donnie McClurkin', bio: 'Gospel singer and minister', website: null },
  { name: 'Tasha Cobbs Leonard', bio: 'Contemporary gospel singer', website: null },
  { name: 'Travis Greene', bio: 'Gospel singer and songwriter', website: null },
  { name: 'William McDowell', bio: 'Worship leader and singer', website: null },
];

// Sample songs
const sampleSongs = [
  {
    title: 'Amazing Grace',
    artistName: 'Kirk Franklin',
    key_signature: 'G',
    tempo: 120,
    genre: 'Gospel',
    chords: ['G', 'C', 'G', 'D', 'G'],
    lyrics: 'Amazing grace, how sweet the sound\nThat saved a wretch like me\nI once was lost, but now am found\nWas blind, but now I see',
    description: 'Classic gospel hymn'
  },
  {
    title: 'How Great Thou Art',
    artistName: 'CeCe Winans',
    key_signature: 'C',
    tempo: 110,
    genre: 'Gospel',
    chords: ['C', 'F', 'C', 'G', 'C'],
    lyrics: 'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made',
    description: 'Powerful worship song'
  },
  {
    title: 'Great Is Thy Faithfulness',
    artistName: 'Fred Hammond',
    key_signature: 'F',
    tempo: 115,
    genre: 'Gospel',
    chords: ['F', 'Bb', 'F', 'C', 'F'],
    lyrics: 'Great is Thy faithfulness, O God my Father\nThere is no shadow of turning with Thee',
    description: 'Traditional hymn'
  },
  {
    title: 'Blessed Assurance',
    artistName: 'Yolanda Adams',
    key_signature: 'Eb',
    tempo: 125,
    genre: 'Gospel',
    chords: ['Eb', 'Ab', 'Eb', 'Bb', 'Eb'],
    lyrics: 'Blessed assurance, Jesus is mine\nOh, what a foretaste of glory divine',
    description: 'Classic hymn'
  },
  {
    title: 'It Is Well',
    artistName: 'Tasha Cobbs Leonard',
    key_signature: 'D',
    tempo: 105,
    genre: 'Gospel',
    chords: ['D', 'G', 'D', 'A', 'D'],
    lyrics: 'When peace like a river attendeth my way\nWhen sorrows like sea billows roll',
    description: 'Comforting worship song'
  },
  {
    title: 'I Can Only Imagine',
    artistName: 'Donnie McClurkin',
    key_signature: 'A',
    tempo: 100,
    genre: 'Gospel',
    chords: ['A', 'D', 'A', 'E', 'A'],
    lyrics: 'I can only imagine what it will be like\nWhen I walk by Your side',
    description: 'Contemporary gospel'
  },
  {
    title: 'Break Every Chain',
    artistName: 'Tasha Cobbs Leonard',
    key_signature: 'E',
    tempo: 130,
    genre: 'Gospel',
    chords: ['E', 'A', 'E', 'B', 'E'],
    lyrics: 'There is power in the name of Jesus\nTo break every chain',
    description: 'Powerful worship anthem'
  },
  {
    title: 'Still Here',
    artistName: 'Travis Greene',
    key_signature: 'C',
    tempo: 120,
    genre: 'Gospel',
    chords: ['C', 'F', 'C', 'G', 'C'],
    lyrics: 'Still here, still here\nBy Your grace, I\'m still here',
    description: 'Testimony song'
  },
  {
    title: 'I Give Myself Away',
    artistName: 'William McDowell',
    key_signature: 'G',
    tempo: 110,
    genre: 'Gospel',
    chords: ['G', 'C', 'G', 'D', 'G'],
    lyrics: 'I give myself away\nI give myself away\nSo You can use me',
    description: 'Worship song'
  },
  {
    title: 'Oceans (Where Feet May Fail)',
    artistName: 'Tasha Cobbs Leonard',
    key_signature: 'D',
    tempo: 95,
    genre: 'Gospel',
    chords: ['D', 'G', 'D', 'A', 'D'],
    lyrics: 'You call me out upon the waters\nThe great unknown where feet may fail',
    description: 'Worship ballad'
  },
];

function createSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  const sql = postgres(DATABASE_URL, { 
    ssl: 'require',
    max: 1 
  });
  
  try {
    // Step 1: Create artists
    console.log('\n👥 Step 1: Creating artists...');
    const artistMap = new Map();
    
    for (const artistData of sampleArtists) {
      try {
        // Check if artist exists
        const existing = await sql`
          SELECT id FROM artists WHERE LOWER(name) = LOWER(${artistData.name}) LIMIT 1
        `;
        
        if (existing && existing.length > 0) {
          console.log(`   ⏭️  Artist "${artistData.name}" already exists`);
          artistMap.set(artistData.name.toLowerCase(), existing[0].id);
        } else {
          const result = await sql`
            INSERT INTO artists (name, bio, website, created_at, updated_at)
            VALUES (${artistData.name}, ${artistData.bio || null}, ${artistData.website || null}, NOW(), NOW())
            RETURNING id, name
          `;
          if (result && result.length > 0) {
            console.log(`   ✅ Created artist: ${result[0].name}`);
            artistMap.set(artistData.name.toLowerCase(), result[0].id);
          }
        }
      } catch (error) {
        console.warn(`   ⚠️  Error creating artist "${artistData.name}":`, error.message);
      }
    }
    
    console.log(`\n✅ Created/found ${artistMap.size} artists\n`);
    
    // Step 2: Create songs
    console.log('🎵 Step 2: Creating songs...');
    let songsCreated = 0;
    
    for (const songData of sampleSongs) {
      try {
        const artistId = artistMap.get(songData.artistName.toLowerCase());
        if (!artistId) {
          console.warn(`   ⚠️  Artist "${songData.artistName}" not found, skipping song "${songData.title}"`);
          continue;
        }
        
        // Check if song exists
        const existing = await sql`
          SELECT id FROM songs 
          WHERE LOWER(title) = LOWER(${songData.title}) 
          AND artist_id = ${artistId}
          LIMIT 1
        `;
        
        if (existing && existing.length > 0) {
          console.log(`   ⏭️  Song "${songData.title}" already exists`);
          continue;
        }
        
        const slug = createSlug(songData.title);
        const result = await sql`
          INSERT INTO songs (
            title,
            artist,
            artist_id,
            slug,
            genre,
            key_signature,
            tempo,
            chords,
            lyrics,
            description,
            rating,
            downloads,
            created_at,
            updated_at
          ) VALUES (
            ${songData.title},
            ${songData.artistName},
            ${artistId},
            ${slug},
            ${songData.genre},
            ${songData.key_signature},
            ${songData.tempo},
            ${songData.chords || null},
            ${songData.lyrics || null},
            ${songData.description || null},
            0,
            0,
            NOW(),
            NOW()
          )
          RETURNING id, title
        `;
        
        if (result && result.length > 0) {
          console.log(`   ✅ Created song: ${result[0].title}`);
          songsCreated++;
        }
      } catch (error) {
        console.warn(`   ⚠️  Error creating song "${songData.title}":`, error.message);
      }
    }
    
    console.log(`\n✅ Created ${songsCreated} new songs\n`);
    
    // Step 3: Create a test user (optional)
    console.log('👤 Step 3: Creating test user...');
    try {
      const testEmail = 'test@example.com';
      const testPassword = 'password123';
      const passwordHash = await bcrypt.hash(testPassword, 10);
      
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${testEmail} LIMIT 1
      `;
      
      if (existingUser && existingUser.length > 0) {
        console.log('   ⏭️  Test user already exists');
      } else {
        await sql`
          INSERT INTO users (
            email,
            password_hash,
            full_name,
            role,
            created_at,
            updated_at
          ) VALUES (
            ${testEmail},
            ${passwordHash},
            'Test User',
            'user',
            NOW(),
            NOW()
          )
        `;
        console.log('   ✅ Created test user');
        console.log(`   📝 Email: ${testEmail}`);
        console.log(`   🔑 Password: ${testPassword}`);
      }
    } catch (error) {
      console.warn('   ⚠️  Error creating test user:', error.message);
    }
    
    // Step 4: Summary
    console.log('\n📊 Step 4: Database Summary...');
    
    const counts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM artists) as artists,
        (SELECT COUNT(*) FROM songs) as songs,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM resources) as resources
    `;
    
    const stats = counts[0];
    console.table({
      'Artists': stats.artists,
      'Songs': stats.songs,
      'Users': stats.users,
      'Resources': stats.resources
    });
    
    console.log('\n🎉 Database seeding complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Test registration/login');
    console.log('   2. Browse songs and artists');
    console.log('   3. Add more content via admin panel');
    
  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('\n👋 Connection closed');
  }
}

seedDatabase();

