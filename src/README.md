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
