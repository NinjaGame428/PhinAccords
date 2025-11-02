// Test database connection
const postgres = require('postgres');

const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ No DATABASE_URL found in environment');
  process.exit(1);
}

console.log('🔌 Testing database connection...');
console.log('📋 Connection string (masked):', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10
});

async function test() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Connection test successful:', result);
    
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log('\n📊 Available tables:', tables.map(t => t.tablename));
    
    const songCount = await sql`SELECT COUNT(*) as count FROM songs`;
    console.log('\n🎵 Songs in database:', songCount[0].count);
    
    const artistCount = await sql`SELECT COUNT(*) as count FROM artists`;
    console.log('👥 Artists in database:', artistCount[0].count);
    
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log('👤 Users in database:', userCount[0].count);
    
    await sql.end();
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.error('Full error:', error);
    await sql.end();
    process.exit(1);
  }
}

test();

