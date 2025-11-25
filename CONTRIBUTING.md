# Contributing to Grafana PostgreSQL EXPLAIN Visualizer

Thank you for your interest in contributing! This guide will help you get started.

## Development Environment

### Prerequisites

- Node.js 18+ (20 LTS recommended)
- npm 9+
- Git
- A code editor (VS Code recommended)

### Supported Operating Systems

All development scripts work on:
- Windows 10/11
- macOS 12+ (Monterey and later)
- Linux (Ubuntu, Debian, Fedora, etc.)

No PowerShell, Bash, or platform-specific tools required!

## Getting Started

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/cybertec-pev-panel.git
   cd cybertec-pev-panel
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

## Development Workflow

### Building

```bash
# Production build
npm run build

# Development build with watch mode
npm run dev
```

### Testing

```bash
# Interactive test runner
npm test

# CI mode (all tests, no watch)
npm run test:ci
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Type check
npm run typecheck
```

### Cleaning

```bash
# Remove build artifacts
npm run clean
```

## Project Structure

```
cybertec-pev-panel/
├── src/
│   ├── components/       # React components
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── module.ts         # Plugin entry point
│   └── plugin.json       # Plugin metadata
├── scripts/
│   ├── build.js          # OS-agnostic build script
│   ├── clean.js          # OS-agnostic clean script
│   └── package.js        # OS-agnostic packaging script
├── tests/                # Test files
├── .github/
│   └── workflows/        # GitHub Actions
└── specs/                # Feature specifications

```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation

### 3. Run Quality Checks

```bash
# Run all checks
npm run lint
npm run typecheck
npm run test:ci
npm run build
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "Description of your changes"
```

We use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process or auxiliary tool changes

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Cross-Platform Development

### Why Node.js Scripts?

All build, test, and packaging scripts are written in Node.js instead of shell scripts to ensure they work identically on Windows, macOS, and Linux.

### Adding New Scripts

When adding new scripts:

1. **Use Node.js** instead of bash/PowerShell
2. **Use path.join()** for file paths
3. **Use fs promises** for async operations
4. **Test on multiple platforms** if possible

Example:
```javascript
const path = require('path');
const fs = require('fs');

// ✅ Good - works everywhere
const filePath = path.join(__dirname, 'dist', 'plugin.json');

// ❌ Bad - Unix only
const filePath = __dirname + '/dist/plugin.json';

// ❌ Bad - Windows only
const filePath = __dirname + '\\dist\\plugin.json';
```

### CI/CD

GitHub Actions workflows run on Ubuntu Linux. All scripts are guaranteed to work there because they use Node.js.

## Testing

### Unit Tests

```bash
npm test
```

Tests are located in `tests/` and use Jest.

### Integration Tests

```bash
npm run e2e
```

End-to-end tests use Cypress and Grafana's e2e framework.

### Manual Testing

1. Start Grafana with Docker:
   ```bash
   npm run server
   ```

2. Open http://localhost:3000
3. Add a PostgreSQL data source
4. Create a panel with EXPLAIN query
5. Select "Postgres Explain Visualizer" visualization

## Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Grafana's official config
- **Prettier**: For consistent formatting
- **Line length**: 120 characters

Run `npm run format` before committing.

## Documentation

When adding features:
- Update `src/README.md`
- Add JSDoc comments to functions
- Update type definitions
- Add examples if applicable

## Release Process

Releases are automated via GitHub Actions:

1. Update version in `src/plugin.json`
2. Commit: `git commit -am "Release v1.2.0"`
3. Tag: `git tag v1.2.0`
4. Push: `git push origin main --tags`

GitHub Actions will:
- Build the plugin
- Run all tests
- Sign the plugin (if configured)
- Create GitHub Release
- Upload artifacts

## Getting Help

- **Issues**: Check existing issues or create a new one
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: See `src/README.md` and `.github/workflows/README.md`

## Code of Conduct

Be respectful and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
