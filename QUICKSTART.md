# Quick Reference Card

## Common Commands

### Development
```bash
npm install              # Install dependencies
npm run dev             # Start development server with hot reload
npm run server          # Start Grafana in Docker
```

### Building
```bash
npm run build           # Production build
npm run clean           # Remove build artifacts
```

### Quality Checks
```bash
npm run lint            # Check code quality
npm run lint:fix        # Auto-fix linting issues
npm run format          # Format code with Prettier
npm run typecheck       # TypeScript type checking
```

### Testing
```bash
npm test                # Interactive tests (watch mode)
npm run test:ci         # Run all tests (CI mode)
npm run e2e             # End-to-end tests
```

### Packaging & Release
```bash
npm run package         # Create distribution ZIP
npm run sign            # Sign plugin (requires GRAFANA_ACCESS_POLICY_TOKEN)
```

## File Structure

```
cybertec-pev-panel/
├── src/                   # Source code
│   ├── components/        # React components
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   ├── utils/             # Utilities
│   ├── module.ts          # Entry point
│   └── plugin.json        # Plugin metadata
├── scripts/               # Build scripts (Node.js)
│   ├── build.js           # Production build
│   ├── clean.js           # Clean artifacts
│   └── package.js         # Create ZIP
├── .github/workflows/     # CI/CD pipelines
├── dist/                  # Build output (gitignored)
└── tests/                 # Test files
```

## Quick Start

### First Time Setup
```bash
git clone <repo-url>
cd cybertec-pev-panel
npm install
npm run dev
```

### Development Workflow
```bash
# Make changes to src/
npm run lint              # Check quality
npm run typecheck         # Check types
npm run build             # Build
npm run package           # Create ZIP
```

### Creating a Release
```bash
# 1. Update version in src/plugin.json
# 2. Commit and tag
git commit -am "Release v1.2.0"
git tag v1.2.0
git push origin main --tags

# 3. GitHub Actions will automatically:
#    - Run tests and linting
#    - Build the plugin
#    - Sign it (if configured)
#    - Create GitHub Release
#    - Upload artifacts
```

## GitHub Actions Setup

### Enable Plugin Signing

1. Get token from https://grafana.com/orgs
2. Go to: Repository → Settings → Secrets → Actions
3. Add secret:
   - Name: `GRAFANA_ACCESS_POLICY_TOKEN`
   - Value: Your token

### Trigger Release

Push a version tag:
```bash
git tag v1.0.0
git push --tags
```

## Troubleshooting

### Build fails
```bash
npm run clean
npm install
npm run build
```

### Tests fail
```bash
npm run test:ci -- --verbose
```

### Package not created
```bash
# Ensure dist/ exists
npm run build
# Then package
npm run package
```

### Scripts not working
```bash
# Check Node.js version (must be 18+)
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Platform Notes

### All Scripts Work On:
- ✅ Windows (10/11)
- ✅ macOS (12+)
- ✅ Linux (Ubuntu, Debian, Fedora, etc.)

### No Dependencies On:
- ❌ PowerShell
- ❌ Bash
- ❌ Platform-specific tools

### Everything Uses:
- ✅ Node.js (built-in modules)
- ✅ npm scripts
- ✅ Cross-platform paths

## Documentation

- **CONTRIBUTING.md** - Developer guide
- **src/README.md** - User documentation
- **scripts/README.md** - Build scripts guide
- **.github/workflows/README.md** - CI/CD guide

## Support

- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Docs: See README files above
