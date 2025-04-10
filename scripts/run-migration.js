#!/usr/bin/env node

/**
 * Script to run SQL migrations against Supabase
 * 
 * Usage: node scripts/run-migration.js migrations/user_stats_table.sql
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Get migration file path from command line arguments
const migrationFilePath = process.argv[2];

if (!migrationFilePath) {
  console.error('Error: No migration file specified.');
  console.error('Usage: node scripts/run-migration.js <migration-file-path>');
  process.exit(1);
}

// Resolve the migration file path
const resolvedPath = path.resolve(process.cwd(), migrationFilePath);

// Check if the migration file exists
if (!fs.existsSync(resolvedPath)) {
  console.error(`Error: Migration file not found: ${resolvedPath}`);
  process.exit(1);
}

// Read the migration file
const migrationSql = fs.readFileSync(resolvedPath, 'utf8');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Run the migration
async function runMigration() {
  console.log(`Running migration: ${migrationFilePath}`);
  
  try {
    // Execute the SQL migration
    const { error } = await supabase.rpc('pgmigrate', { query: migrationSql });
    
    if (error) {
      console.error('Error running migration:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  }
}

runMigration();
