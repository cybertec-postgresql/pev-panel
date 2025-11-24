# Quickstart Guide: PostgreSQL EXPLAIN Visualizer

**Date**: 2025-11-24  
**Plugin**: cybertec-pev-panel  
**Version**: Development

This guide will help you set up, build, and test the PostgreSQL EXPLAIN Visualizer Grafana plugin.

---

## Prerequisites

### Required Software

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (comes with Node.js)
- **Grafana**: 10.4.0 or higher (for local testing)
- **PostgreSQL**: 10+ (optional, for testing with real database)
- **Git**: For version control

### Verify Installation

```bash
node --version   # Should be 18.x or higher
npm --version    # Should be 9.x or higher
```

---

## Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/cybertec-pev-panel.git
cd cybertec-pev-panel
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Grafana plugin SDK (@grafana/data, @grafana/ui, @grafana/runtime)
- Vue 3 runtime
- PEV2 library
- TypeScript and build tools
- Testing frameworks (Jest, React Testing Library)

### Step 3: Build Plugin

**Development Build** (with source maps):
```bash
npm run dev
```

**Production Build** (optimized):
```bash
npm run build
```

Build output is created in `dist/` directory:
- `module.js` - Main plugin bundle
- `module.js.map` - Source map for debugging
- `plugin.json` - Plugin metadata
- `img/` - Plugin logo and screenshots

### Step 4: Link Plugin to Grafana

**Option A: Docker (Recommended)**

```bash
# Start Grafana with plugin mounted
docker run -d \
  -p 3000:3000 \
  -v "$(pwd)/dist:/var/lib/grafana/plugins/cybertec-pev-panel" \
  --name=grafana \
  grafana/grafana:latest
```

**Option B: Local Grafana Installation**

```bash
# Find Grafana plugins directory
# Linux: /var/lib/grafana/plugins/
# macOS: /usr/local/var/lib/grafana/plugins/
# Windows: C:\Program Files\GrafanaLabs\grafana\data\plugins\

# Create symlink (Unix/Mac)
ln -s /path/to/cybertec-pev-panel/dist /var/lib/grafana/plugins/cybertec-pev-panel

# Copy directory (Windows)
xcopy /E /I dist "C:\Program Files\GrafanaLabs\grafana\data\plugins\cybertec-pev-panel"
```

### Step 5: Restart Grafana

```bash
# Docker
docker restart grafana

# Linux (systemd)
sudo systemctl restart grafana-server

# macOS (Homebrew)
brew services restart grafana

# Windows (Service)
net stop "Grafana" && net start "Grafana"
```

### Step 6: Verify Plugin Loaded

1. Open Grafana: http://localhost:3000
2. Log in (default: admin/admin)
3. Navigate to **Configuration > Plugins**
4. Search for "Postgres Explain Visualizer"
5. Plugin should appear with status "Enabled"

---

## Testing the Plugin

### Test 1: Using TestData Data Source

1. Create new dashboard
2. Add new panel
3. Select visualization: **Postgres Explain Visualizer**
4. Configure query:
   - Data source: **TestData DB**
   - Scenario: **CSV Content**
   - Data:
     ```csv
     plan
     {"Plan":{"Node Type":"Seq Scan","Relation Name":"users","Startup Cost":0.00,"Total Cost":35.50,"Plan Rows":1000,"Plan Width":244}}
     ```
5. Panel should display visualization of sequential scan

### Test 2: Using PostgreSQL Data Source

**Setup PostgreSQL Data Source**:
1. Navigate to **Configuration > Data Sources**
2. Add **PostgreSQL** data source
3. Configure connection:
   - Host: `localhost:5432`
   - Database: your_database
   - User: your_user
   - Password: your_password
   - SSL Mode: disable (for local dev)
4. Click **Save & Test**

**Create EXPLAIN Panel**:
1. Create new dashboard
2. Add new panel
3. Select visualization: **Postgres Explain Visualizer**
4. Configure query (use query editor, not builder):
   ```sql
   EXPLAIN (FORMAT JSON, ANALYZE, BUFFERS)
   SELECT u.*, o.total
   FROM users u
   JOIN orders o ON u.id = o.user_id
   WHERE u.age > 25
   ORDER BY o.total DESC
   LIMIT 10;
   ```
5. Set panel options:
   - Plan Field Name: `QUERY PLAN`
   - Force JSON Mode: `false` (auto-detect)
   - Font Size: `14`
   - Dark Mode: `false` (follow theme)

### Test 3: Using JSON API Data Source

**Mock JSON API** (using TestData):
1. Create panel
2. Data source: **TestData DB**
3. Scenario: **JSON**
4. JSON content:
   ```json
   {
     "execution_plan": {
       "Plan": {
         "Node Type": "Hash Join",
         "Join Type": "Inner",
         "Startup Cost": 45.00,
         "Total Cost": 125.50,
         "Plan Rows": 500,
         "Plan Width": 360,
         "Plans": [
           {
             "Node Type": "Seq Scan",
             "Relation Name": "users",
             "Startup Cost": 0.00,
             "Total Cost": 35.50,
             "Plan Rows": 1000,
             "Plan Width": 244
           },
           {
             "Node Type": "Hash",
             "Startup Cost": 10.00,
             "Total Cost": 10.00,
             "Plan Rows": 250,
             "Plan Width": 116
           }
         ]
       }
     }
   }
   ```
5. Panel options:
   - Plan Field Name: `execution_plan`

---

## Sample Queries

### Simple Sequential Scan

```sql
EXPLAIN (FORMAT JSON)
SELECT * FROM users WHERE age > 18;
```

### Index Scan

```sql
EXPLAIN (FORMAT JSON, ANALYZE)
SELECT * FROM users WHERE id = 12345;
```

### Join with Aggregation

```sql
EXPLAIN (FORMAT JSON, ANALYZE, BUFFERS)
SELECT 
  u.country,
  COUNT(*) as user_count,
  AVG(o.total) as avg_order_total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.country
HAVING COUNT(*) > 100
ORDER BY avg_order_total DESC;
```

### Complex Query with CTE

```sql
EXPLAIN (FORMAT JSON, ANALYZE)
WITH recent_orders AS (
  SELECT user_id, SUM(total) as total_spent
  FROM orders
  WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT u.name, u.email, ro.total_spent
FROM users u
JOIN recent_orders ro ON u.id = ro.user_id
WHERE ro.total_spent > 1000
ORDER BY ro.total_spent DESC
LIMIT 20;
```

### Text Format EXPLAIN (auto-convert)

```sql
EXPLAIN ANALYZE
SELECT * FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.age > 25;
```

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- dataExtractor.test.ts

# Watch mode (re-run on file changes)
npm test -- --watch
```

### Integration Tests

```bash
# Run integration tests
npm test -- --testPathPattern=integration

# Run specific integration test
npm test -- panel-render.test.tsx
```

### E2E Tests (if implemented)

```bash
# Run Playwright tests
npm run test:e2e
```

---

## Development Workflow

### Watch Mode (Hot Reload)

```bash
# Start development server with watch mode
npm run dev

# In separate terminal, restart Grafana when build completes
# Or use Grafana development server if available
```

### Debugging

**Browser DevTools**:
1. Open panel in Grafana
2. Press F12 to open DevTools
3. Go to Sources tab
4. Search for your source files (use source maps)
5. Set breakpoints and inspect variables

**Console Logging**:
```typescript
// Use logger utility
import { logger } from './utils/logger';

logger.info('DataExtractor', 'Extracting plan data', { data, options });
logger.warn('FormatDetector', 'Multiple series detected', { count });
logger.error('TextParser', 'Parse failed', error, { input });
```

**React DevTools**:
1. Install React DevTools browser extension
2. Open extension in Grafana
3. Inspect component tree and props

### Code Formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

---

## Troubleshooting

### Plugin Not Appearing in Grafana

**Symptoms**: Plugin doesn't show in plugin list

**Solutions**:
1. Check dist/ directory exists and contains built files
2. Verify plugin.json has correct structure
3. Check Grafana logs for loading errors:
   ```bash
   # Docker
   docker logs grafana
   
   # Linux
   sudo journalctl -u grafana-server -f
   
   # Check log file directly
   tail -f /var/log/grafana/grafana.log
   ```
4. Restart Grafana after plugin installation
5. Check Grafana configuration allows unsigned plugins:
   ```ini
   [plugins]
   allow_loading_unsigned_plugins = cybertec-pev-panel
   ```

### Build Errors

**Symptoms**: `npm run build` fails

**Solutions**:
1. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Check Node.js version (must be 18+)
3. Clear webpack cache:
   ```bash
   rm -rf .config/.cache
   ```
4. Check TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```

### Panel Shows "No data"

**Symptoms**: Panel displays "No data available" message

**Solutions**:
1. Verify query returns data (test in query inspector)
2. Check field name matches panel option:
   - PostgreSQL: typically "QUERY PLAN"
   - JSON API: varies, check API response
3. Use Grafana query inspector (click query stats):
   - View raw response data
   - Check field names
4. Enable browser console and look for errors

### Visualization Not Rendering

**Symptoms**: Panel is blank or shows error

**Solutions**:
1. Check browser console for errors
2. Verify EXPLAIN output is valid JSON:
   ```sql
   -- Use FORMAT JSON
   EXPLAIN (FORMAT JSON) SELECT ...;
   
   -- Not just EXPLAIN
   -- EXPLAIN SELECT ...; -- This returns text format
   ```
3. Test with simple query first:
   ```sql
   EXPLAIN (FORMAT JSON) SELECT 1;
   ```
4. Check PEV2 compatibility (PostgreSQL 10+)

### CSP Errors

**Symptoms**: Console shows "blocked by Content Security Policy"

**Solutions**:
1. Verify all assets are bundled (no CDN URLs)
2. Check Grafana CSP settings in grafana.ini:
   ```ini
   [security]
   content_security_policy = true
   content_security_policy_template = ...
   ```
3. Check webpack bundling includes Vue and PEV2
4. Rebuild plugin: `npm run build`

### Performance Issues

**Symptoms**: Panel is slow or unresponsive

**Solutions**:
1. Reduce plan complexity (add WHERE clause to query)
2. Increase fontSize option (less elements to render)
3. Use EXPLAIN without ANALYZE for faster planning
4. Check browser performance tools (F12 > Performance)

---

## Configuration Reference

### Plugin Options

Available in panel editor under "Panel options":

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| Plan Field Name | string | "plan" | DataFrame field with EXPLAIN data |
| Force JSON Mode | boolean | false | Skip format detection |
| Font Size | number | 14 | Text size (10-24 px) |
| Dark Mode | boolean | false | Override theme detection |

### Environment Variables

For development:

```bash
# Set Grafana API URL (for plugin signing)
export GRAFANA_API_URL=http://localhost:3000

# Enable development mode
export NODE_ENV=development

# Enable source maps
export GENERATE_SOURCEMAP=true
```

---

## Next Steps

1. **Read the Implementation Plan**: See `specs/001-grafana-explain-panel/plan.md` for detailed architecture
2. **Review Research Findings**: See `specs/001-grafana-explain-panel/research.md` for technical decisions
3. **Explore Contracts**: Check `specs/001-grafana-explain-panel/contracts/` for TypeScript interfaces
4. **Start Development**: Follow the 14-step implementation plan in `plan.md`

---

## Resources

- **Grafana Plugin Documentation**: https://grafana.com/docs/grafana/latest/developers/plugins/
- **PostgreSQL EXPLAIN Documentation**: https://www.postgresql.org/docs/current/using-explain.html
- **PEV2 Library**: https://github.com/dalibo/pev2
- **Vue 3 Documentation**: https://vuejs.org/guide/introduction.html
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

## Support

For issues or questions:

1. Check this quickstart guide
2. Review troubleshooting section
3. Check browser console for errors
4. Review Grafana logs
5. Open issue on GitHub repository

**Remember**: Always use EXPLAIN (FORMAT JSON) for best results!
