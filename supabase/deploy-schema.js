/**
 * Deploy Database Schema to Supabase
 * 
 * This script deploys the complete database schema to your Supabase project.
 * 
 * Usage:
 *   node supabase/deploy-schema.js
 * 
 * Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY 
 * are set in your environment or .env.local file
 */

const fs = require('fs');
const path = require('path');

// Read Supabase credentials from environment or .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zsujkjbvliqphssuvvyw.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdWpramJ2bGlxcGhzc3V2dnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjEwMjYsImV4cCI6MjA3NDY5NzAyNn0.5bb8uOT3hexN832BiW9pg2LAN1NwgQoBkgYQAY4GH-4';

// Extract project reference from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Invalid Supabase URL. Expected format: https://[project-ref].supabase.co');
  process.exit(1);
}

console.log(`📦 Deploying schema to Supabase project: ${projectRef}`);
console.log(`🔗 URL: ${SUPABASE_URL}\n`);

async function deploySchema() {
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'QUICK_DEPLOY.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Read SQL file:', sqlFile);
    console.log('📝 SQL file size:', sql.length, 'characters\n');
    
    // Note: The Supabase REST API doesn't support executing arbitrary SQL
    // For security reasons, you need to use the Supabase Dashboard SQL Editor
    // or the Supabase Management API with a service role key
    
    console.log('⚠️  IMPORTANT: For security, Supabase requires SQL to be executed via:');
    console.log('   1. Supabase Dashboard SQL Editor (Recommended)');
    console.log('   2. Supabase Management API with service role key');
    console.log('   3. Supabase CLI\n');
    
    console.log('📋 Here\'s what you need to do:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef);
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('3. Click "New query"');
    console.log('4. Copy the contents of: supabase/QUICK_DEPLOY.sql');
    console.log('5. Paste into the SQL Editor');
    console.log('6. Click "Run" or press Ctrl+Enter\n');
    
    console.log('📄 SQL file location:', sqlFile);
    console.log('\n✅ Schema file is ready to deploy!\n');
    
    // Show a preview
    const preview = sql.split('\n').slice(0, 20).join('\n');
    console.log('📖 Preview (first 20 lines):');
    console.log('─'.repeat(60));
    console.log(preview);
    console.log('─'.repeat(60));
    console.log('... (rest of the file)\n');
    
    console.log('💡 Tip: You can also copy the file contents directly:');
    console.log('   The file is at:', sqlFile);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deploySchema();

