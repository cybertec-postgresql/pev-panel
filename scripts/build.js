#!/usr/bin/env node
/**
 * Cross-platform build script for Grafana plugin
 * Ensures consistent build process across all platforms
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');

console.log('🔨 Building Grafana plugin...\n');

try {
  // Clean dist directory if it exists
  if (fs.existsSync(DIST_DIR)) {
    console.log('🗑️  Cleaning dist/ directory...');
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }

  // Run webpack build
  console.log('⚙️  Running webpack build...\n');
  execSync('webpack -c ./webpack.config.ts --env production', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('\n✅ Build completed successfully!');

  // Display build artifacts
  if (fs.existsSync(DIST_DIR)) {
    const files = fs.readdirSync(DIST_DIR);
    console.log(`\n📁 Build artifacts (${files.length} files):`);
    files.forEach(file => {
      const filePath = path.join(DIST_DIR, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`   - ${file} (${sizeKB} KB)`);
      }
    });
  }

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
