#!/usr/bin/env node
/**
 * Cross-platform clean script
 * Removes build artifacts and temporary files
 */

const fs = require('fs');
const path = require('path');

const DIRS_TO_CLEAN = [
  'dist',
  'coverage',
  '.cache'
];

const FILES_TO_CLEAN = [
  'cybertec-pev-panel.zip'
];

console.log('🧹 Cleaning build artifacts...\n');

let cleaned = 0;

// Clean directories
DIRS_TO_CLEAN.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✓ Removed ${dir}/`);
    cleaned++;
  }
});

// Clean files
FILES_TO_CLEAN.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✓ Removed ${file}`);
    cleaned++;
  }
});

if (cleaned === 0) {
  console.log('✨ Already clean!');
} else {
  console.log(`\n✅ Cleaned ${cleaned} items`);
}
