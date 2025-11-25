# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated CI/CD.

## Workflows

### `release.yml` - Release Automation

**Trigger**: Push version tags (e.g., `v1.0.0`)

**Actions**:
1. Checkout code
2. Setup Node.js 20 with npm cache
3. Install dependencies
4. Run tests (`npm run test:ci`)
5. Run linter (`npm run lint`)
6. Type check (`npm run typecheck`)
7. Build plugin (`npm run build`)
8. Sign plugin if `GRAFANA_ACCESS_POLICY_TOKEN` secret exists
9. Create distribution package (`npm run package`)
10. Create GitHub Release with artifacts
11. Upload artifacts with 90-day retention

**Outputs**:
- GitHub Release with release notes
- `cybertec-pev-panel.zip` - Signed plugin package
- `MANIFEST.txt` - Signature verification file
- Full `dist/` directory artifacts

**Setup Requirements**:

To enable plugin signing, add the `GRAFANA_ACCESS_POLICY_TOKEN` secret:
1. Go to Repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `GRAFANA_ACCESS_POLICY_TOKEN`
4. Value: Token from [Grafana Cloud Portal](https://grafana.com/orgs)

### Other Workflows

- `ci.yml` - Continuous integration for pull requests
- `bundle-stats.yml` - Bundle size analysis
- `is-compatible.yml` - Grafana version compatibility check
- `cp-update.yml` - Dependency updates

## Creating a Release

1. Update version in `src/plugin.json`
2. Commit changes: `git commit -am "Release v1.2.0"`
3. Create and push tag:
   ```bash
   git tag v1.2.0
   git push origin main --tags
   ```
4. GitHub Actions will automatically build and create the release

## Local Testing

Test the release process locally:

```bash
# Clean previous builds
npm run clean

# Run full build pipeline
npm run build

# Create distribution package
npm run package

# Sign plugin (requires GRAFANA_ACCESS_POLICY_TOKEN env var)
export GRAFANA_ACCESS_POLICY_TOKEN=your_token
npm run sign
```

## Workflow Maintenance

All workflows use:
- Node.js 20 (LTS)
- Ubuntu latest runner
- npm for package management
- Node.js scripts (work on all platforms)
