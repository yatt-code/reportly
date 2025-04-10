/**
 * Script to run the migration to organizations and workspaces
 * 
 * This script compiles the TypeScript migration script and runs it.
 */

const { execSync } = require('child_process');
const path = require('path');

// Path to the migration script
const migrationScriptPath = path.join(__dirname, 'migrate-to-orgs.ts');

console.log('Compiling and running migration script...');

try {
  // Run the migration script using ts-node
  execSync(`npx ts-node ${migrationScriptPath}`, { stdio: 'inherit' });
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
