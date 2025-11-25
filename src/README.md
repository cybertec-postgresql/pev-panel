# PostgreSQL EXPLAIN Visualizer

A Grafana panel plugin that visualizes PostgreSQL EXPLAIN output as an interactive tree diagram using the PEV2 (Postgres EXPLAIN Visualizer 2) library.

## Overview

This plugin helps database administrators and developers understand PostgreSQL query execution plans by providing a clear, interactive visualization. It automatically detects and parses both JSON and plain text EXPLAIN output, making query performance analysis accessible directly within Grafana.

## Features

- **Automatic Format Detection**: Supports both `EXPLAIN (FORMAT JSON)` and plain text `EXPLAIN` output
- **Interactive Visualization**: Powered by PEV2, providing expandable tree views with detailed node information
- **Data Source Flexibility**: Works with any Grafana data source (PostgreSQL, JSON API, TestData, etc.)
- **Customizable Display**: Configure font size, dark mode, and field names
- **Comprehensive Error Handling**: Clear error messages with actionable resolution hints

## Requirements

- Grafana 10.4.0 or higher
- PostgreSQL 10+ (for database queries)

## Installation

### From Release

1. Download the latest release from the [releases page](https://github.com/your-org/cybertec-pev-panel/releases)
2. Extract the archive to your Grafana plugins directory
3. Restart Grafana
4. Enable the plugin in your Grafana configuration if needed

### From Source

```bash
git clone https://github.com/your-org/cybertec-pev-panel.git
cd cybertec-pev-panel
npm install
npm run build
```

Link the `dist/` directory to your Grafana plugins folder.

## Getting Started

### 1. Create a Query

Configure your data source to return PostgreSQL EXPLAIN output:

**JSON Format (Recommended):**

```sql
EXPLAIN (FORMAT JSON, ANALYZE, BUFFERS)
SELECT * FROM users WHERE active = true;
```

**Plain Text Format:**

```sql
EXPLAIN ANALYZE
SELECT * FROM users WHERE active = true;
```

### 2. Add the Panel

1. Add a new panel to your dashboard
2. Select "Postgres Explain Visualizer" as the visualization type
3. Configure your query to return EXPLAIN output

### 3. Configure Options

- **Plan Field Name**: Name of the field containing EXPLAIN output (default: "plan")
- **Force JSON Mode**: Skip format auto-detection (useful for performance)
- **Font Size**: Adjust text size (10-24px)
- **Dark Mode**: Force dark theme visualization

## Example Queries

### With PostgreSQL Data Source

```sql
EXPLAIN (FORMAT JSON, ANALYZE, VERBOSE, BUFFERS)
SELECT
  u.username,
  COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.username
ORDER BY order_count DESC
LIMIT 10;
```

### With TestData Data Source

Use CSV or JSON response with a field containing EXPLAIN output for testing.

## Troubleshooting

### "Field not found" Error

The plugin cannot find the specified field name in your query results. Check the "Plan Field Name" setting and ensure it matches your query's output field.

### "Invalid format" Error

The data doesn't match expected EXPLAIN format. Ensure your query returns valid PostgreSQL EXPLAIN output. Use `EXPLAIN (FORMAT JSON)` for guaranteed compatibility.

## Configuration

All configuration is done through panel options:

| Option          | Description                             | Default |
| --------------- | --------------------------------------- | ------- |
| Plan Field Name | DataFrame field containing EXPLAIN data | "plan"  |
| Force JSON Mode | Skip format auto-detection              | false   |
| Font Size       | Visualization text size (px)            | 14      |
| Dark Mode       | Force dark theme                        | false   |

## Development Scripts

All scripts work on Windows, Linux, and macOS:

```bash
# Build the plugin
npm run build

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run tests in CI mode
npm run test:ci

# Type checking
npm run typecheck

# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format

# Clean build artifacts
npm run clean

# Create distribution package
npm run package

# Sign plugin (requires GRAFANA_ACCESS_POLICY_TOKEN)
npm run sign
```

## Publishing to Grafana Marketplace

To publish this plugin to the official Grafana plugin catalog, follow these steps:

### Prerequisites

1. **Create a Grafana Cloud account** at [grafana.com](https://grafana.com)
2. **Generate an access policy token**:
   - Navigate to [Grafana Cloud Portal](https://grafana.com/orgs)
   - Go to "Access Policies"
   - Create a new token with plugin signing permissions
   - Copy the token value

### Signing the Plugin

Plugin signing is **required** for all plugins published to Grafana:

```bash
# Set the access policy token as an environment variable
export GRAFANA_ACCESS_POLICY_TOKEN=your_token_here

# Sign the plugin
npm run sign
```

This generates a `MANIFEST.txt` file in the `dist/` directory containing cryptographic signatures.

### Creating the Distribution Package

```bash
# Build and package the plugin
npm run package
```

This creates `cybertec-pev-panel.zip` containing the signed distribution.

### Submitting to Grafana Catalog

1. **Prepare plugin metadata**:
   - Ensure `src/plugin.json` has complete information
   - Add high-quality screenshots to `src/img/`
   - Create a compelling logo (`src/img/logo.svg`)
   - Verify all links and documentation

2. **Submit the plugin**:
   - Go to [Grafana Plugin Submission](https://grafana.com/plugins/submit)
   - Fill out the submission form
   - Upload your signed plugin package
   - Provide required metadata (category, description, screenshots)

3. **Review process**:
   - Grafana team reviews your submission
   - They check code quality, security, and functionality
   - Review typically takes 5-10 business days
   - You may be asked for changes or clarifications

4. **Publication**:
   - Once approved, your plugin appears in the catalog
   - Users can install it via `grafana-cli` or the UI
   - Updates follow the same signing and submission process

### Installation via grafana-cli

After publication, users can install your plugin with:

```bash
grafana-cli plugins install cybertec-pev-panel
```

### Private Distribution

If you don't want to publish publicly, you can distribute the signed plugin package directly:

1. Share the `cybertec-pev-panel.zip` file
2. Users extract it to their Grafana plugins directory
3. Restart Grafana to load the plugin

For more details, see the [Grafana Plugin Publishing Guide](https://grafana.com/developers/plugin-tools/publish-a-plugin).

## Automated Releases with GitHub Actions

This project includes a GitHub Actions workflow that automatically builds, tests, signs, and publishes release artifacts when you push a version tag.

### Creating a Release

1. **Update version** in `src/plugin.json`:
   ```json
   {
     "info": {
       "version": "1.2.0"
     }
   }
   ```

2. **Commit and tag**:
   ```bash
   git add src/plugin.json
   git commit -m "Release v1.2.0"
   git tag v1.2.0
   git push origin main --tags
   ```

3. **GitHub Actions will automatically**:
   - Install dependencies
   - Run tests and linting
   - Build the plugin
   - Sign the plugin (if `GRAFANA_ACCESS_POLICY_TOKEN` secret is set)
   - Create distribution package
   - Create a GitHub Release with artifacts
   - Upload the signed plugin package

### Setting Up Plugin Signing in CI

To enable automatic plugin signing in GitHub Actions:

1. Generate an access policy token from [Grafana Cloud Portal](https://grafana.com/orgs)
2. Add it as a repository secret:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GRAFANA_ACCESS_POLICY_TOKEN`
   - Value: Your token from step 1
   - Click "Add secret"

The workflow will automatically sign the plugin when this secret is present.

### Release Artifacts

Each release includes:
- `cybertec-pev-panel.zip` - Signed plugin package ready for installation
- `MANIFEST.txt` - Cryptographic signature for verification
- Full `dist/` directory with all build outputs

Users can download the zip file and install it manually, or you can submit it to the Grafana plugin catalog.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/your-org/cybertec-pev-panel/issues).
