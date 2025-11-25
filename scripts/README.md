# Build Scripts

This directory contains build and utility scripts written in Node.js.

## Why Node.js Scripts?

All scripts are written in Node.js to ensure they work identically on Windows, macOS, and Linux.

This eliminates the need for:
- Platform-specific shell scripts (`.sh`, `.ps1`, `.bat`)
- Cross-platform shell script tools (bash on Windows, etc.)
- Different commands for different operating systems

## Available Scripts

### `build.js`

Builds the plugin for production.

**Usage**:
```bash
npm run build
```

**What it does**:
1. Cleans the `dist/` directory
2. Runs webpack with production configuration
3. Lists generated build artifacts with sizes

**Output**: `dist/` directory with compiled plugin

---

### `clean.js`

Removes build artifacts and temporary files.

**Usage**:
```bash
npm run clean
```

**What it does**:
1. Removes `dist/` directory
2. Removes `coverage/` directory
3. Removes `.cache/` directory
4. Removes `*.zip` package files

---

### `package.js`

Creates a distribution ZIP file from the built plugin.

**Usage**:
```bash
npm run package
# or after building:
node scripts/package.js
```

**What it does**:
1. Checks that `dist/` directory exists
2. Removes existing package if present
3. Creates `cybertec-pev-panel.zip` with maximum compression
4. Reports package size

**Output**: `cybertec-pev-panel.zip` in the root directory

**Dependencies**: Uses `archiver` package for cross-platform ZIP creation

---

### `scope-bootstrap.js`

Auto-generated script for Grafana plugin tooling. Do not modify.

---

## Adding New Scripts

When adding new scripts, follow these guidelines:

### 1. Use Node.js

```javascript
#!/usr/bin/env node
// Your script here
```

### 2. Use path.join() for Paths

```javascript
const path = require('path');

// ✅ Correct - works on all platforms
const filePath = path.join(__dirname, '..', 'dist', 'plugin.json');

// ❌ Wrong - Unix only
const filePath = `${__dirname}/../dist/plugin.json`;

// ❌ Wrong - Windows only
const filePath = `${__dirname}\\..\\dist\\plugin.json`;
```

### 3. Use fs for File Operations

```javascript
const fs = require('fs');

// Check if file exists
if (fs.existsSync(filePath)) {
  // Do something
}

// Remove directory recursively (Node 14.14+)
fs.rmSync(dirPath, { recursive: true, force: true });
```

### 4. Use execSync for Shell Commands

```javascript
const { execSync } = require('child_process');

try {
  execSync('npm run build', {
    stdio: 'inherit',  // Show output
    cwd: projectRoot   // Working directory
  });
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
```

### 5. Use Console for Output

```javascript
// Success messages
console.log('✅ Task completed');

// Progress messages
console.log('⚙️  Processing...');

// Error messages
console.error('❌ Error:', error.message);

// Warnings
console.warn('⚠️  Warning:', message);
```

### 6. Handle Errors

```javascript
try {
  // Your code
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);  // Exit with error code
}
```

### 7. Add to package.json

```json
{
  "scripts": {
    "your-script": "node scripts/your-script.js"
  }
}
```

## Testing Scripts Locally

Test on your platform:
```bash
node scripts/build.js
node scripts/clean.js
node scripts/package.js
```

Test via npm:
```bash
npm run build
npm run clean
npm run package
```

## CI/CD

All scripts run in GitHub Actions on Ubuntu Linux. They are guaranteed to work in CI because they use Node.js, which is installed by default.

See `.github/workflows/release.yml` for usage in CI.

## Dependencies

Scripts use only:
- **Node.js built-ins**: `fs`, `path`, `child_process`
- **archiver** (for ZIP creation): Cross-platform ZIP library

No platform-specific dependencies required!

## Troubleshooting

### Script fails with "command not found"

Make sure Node.js is installed:
```bash
node --version  # Should be 18+
```

### Permission denied on Linux/macOS

Scripts should work without execute permissions because they're run via `node`. If needed:
```bash
chmod +x scripts/*.js
```

### Different output on different platforms

This shouldn't happen! If you see platform-specific behavior:
1. Check for hardcoded paths (use `path.join()`)
2. Check for shell-specific commands (use Node.js APIs)
3. Open an issue with details

## Examples

### Run full release process locally

```bash
# Clean previous builds
npm run clean

# Build plugin
npm run build

# Create package
npm run package

# Output: cybertec-pev-panel.zip ready for distribution
```

### Quick development cycle

```bash
# Start watch mode
npm run dev

# In another terminal, test changes
npm run server

# When ready, run quality checks
npm run lint
npm run typecheck
npm run test:ci
```

## Maintenance

Keep scripts:
- **Simple**: One responsibility per script
- **Cross-platform**: Test on Windows, macOS, Linux
- **Well-documented**: Explain what and why
- **Error-handled**: Fail gracefully with clear messages
