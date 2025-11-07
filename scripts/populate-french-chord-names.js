/**
 * Script to populate French chord names and descriptions in the database
 * This reads the SQL file and provides instructions to run it in Supabase
 */

const fs = require('fs');
const path = require('path');

console.log('📝 French Chord Names Population Script');
console.log('=======================================\n');

const sqlFile = path.join(__dirname, '../supabase/add-french-chord-names.sql');

if (!fs.existsSync(sqlFile)) {
  console.error('❌ SQL file not found:', sqlFile);
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFile, 'utf8');

console.log('✅ SQL file found');
console.log('\n📋 Instructions:');
console.log('1. Open your Supabase Dashboard');
console.log('2. Go to SQL Editor');
console.log('3. Copy and paste the contents of: supabase/add-french-chord-names.sql');
console.log('4. Click "Run" to execute');
console.log('\n📄 SQL Content Preview (first 500 chars):');
console.log(sqlContent.substring(0, 500) + '...\n');
console.log('✅ This will:');
console.log('  - Add chord_name_fr and description_fr columns');
console.log('  - Populate French chord names (C -> Do, D -> Ré, etc.)');
console.log('  - Translate all chord descriptions to French');
console.log('  - Create indexes for performance');
console.log('\n🚀 After running the SQL, French chord names will be automatically used when language=fr');

