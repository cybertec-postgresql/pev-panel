# PostgreSQL EXPLAIN Visualizer Panel for Grafana

Visualize PostgreSQL EXPLAIN output as interactive tree diagrams in Grafana.

## Install

```bash
npm install
npm run build
```

Copy `dist/` to your Grafana plugins directory and restart Grafana.

## Usage

1. Query PostgreSQL with `EXPLAIN (FORMAT JSON)` or `EXPLAIN`
2. Add panel and select "Postgres Explain Visualizer"
3. Set "Plan Field Name" to match your query output field

## Develop

```bash
npm run dev     # Watch mode
npm run server  # Run Grafana in Docker
npm test        # Run tests
```

## Scripts

- `npm run build` - Production build
- `npm run clean` - Remove artifacts
- `npm run lint` - Check code
- `npm run typecheck` - Check types
- `npm run package` - Create distribution ZIP
- `npm run sign` - Sign plugin (requires `GRAFANA_ACCESS_POLICY_TOKEN`)

## Release

```bash
git tag v1.0.0
git push --tags
```

GitHub Actions will build, sign, and create a release.

## License

Apache-2.0 - see [LICENSE](LICENSE)

## Links

- [Repository](https://github.com/cybertec-postgresql/pev-panel)
- [Issues](https://github.com/cybertec-postgresql/pev-panel/issues)
