// Deploy Supabase schema using Node.js
// This script can be used if Supabase CLI is not available

const fs = require('fs');
const path = require('path');

console.log('📋 Supabase Schema Deployment Guide\n');
console.log('Since Supabase CLI installation requires specific package managers,');
console.log('please use one of these methods:\n');

console.log('Method 1: Supabase Dashboard (Easiest)');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Navigate to SQL Editor');
console.log('4. Run these files in order:');
console.log('   - supabase/schema.sql');
console.log('   - supabase/user-analytics-tables.sql');
console.log('   - supabase/migration-complete.sql\n');

console.log('Method 2: Supabase CLI');
console.log('1. Install Supabase CLI:');
console.log('   Windows: scoop install supabase');
console.log('   macOS: brew install supabase/tap/supabase');
console.log('   Linux: Download from GitHub releases\n');
console.log('2. Login: supabase login');
console.log('3. Link: supabase link --project-ref your-project-ref');
console.log('4. Deploy: supabase db push\n');

console.log('Method 3: Using this script with psql');
console.log('If you have psql installed, you can run:');
console.log('psql "your-connection-string" < supabase/schema.sql\n');

// List available SQL files
const sqlFiles = [
  'supabase/schema.sql',
  'supabase/user-analytics-tables.sql',
  'supabase/migration-complete.sql'
];

console.log('Available SQL files to deploy:');
sqlFiles.forEach((file, index) => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${index + 1}. ${file} ${exists ? '✅' : '❌'}`);
});

console.log('\n💡 Recommendation: Use Method 1 (Supabase Dashboard) for easiest deployment');

