/**
 * Cross-platform packaging script for Grafana plugin
 * Creates a distribution zip from the dist/ directory
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const OUTPUT_ZIP = path.join(__dirname, '..', 'cybertec-pev-panel.zip');

// Check if dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Error: dist/ directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Remove existing zip if present
if (fs.existsSync(OUTPUT_ZIP)) {
  fs.unlinkSync(OUTPUT_ZIP);
  console.log('🗑️  Removed existing package');
}

console.log('📦 Creating distribution package...');

// Create write stream for output
const output = fs.createWriteStream(OUTPUT_ZIP);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for all archive data to be written
output.on('close', () => {
  const sizeInMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
  console.log(`\n✅ Package created successfully: cybertec-pev-panel.zip (${sizeInMB} MB)`);
  console.log('📦 Ready for distribution or Grafana marketplace submission');
});

// Handle warnings
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('⚠️  Warning:', err.message);
  } else {
    throw err;
  }
});

// Handle errors
archive.on('error', (err) => {
  console.error('❌ Error creating package:', err.message);
  process.exit(1);
});

// Pipe archive data to the file
archive.pipe(output);

// Add all files from dist directory inside a subdirectory named after the plugin ID
// This is required by Grafana's plugin packaging format
archive.directory(DIST_DIR, 'cybertec-pev-panel');

// Finalize the archive
archive.finalize();
