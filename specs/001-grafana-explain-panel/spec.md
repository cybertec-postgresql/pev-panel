# Feature Specification: Grafana PostgreSQL Explain Visualizer Panel Plugin

**Feature Branch**: `001-grafana-explain-panel`  
**Created**: 2025-11-24  
**Status**: Draft  
**Input**: User description: "Write a full formal specification for a Grafana Panel Plugin called 'Postgres Explain Visualizer'. The plugin must display PostgreSQL EXPLAIN output using the PEV2 visualization library."

## Problem Statement

Database administrators, performance engineers, and developers need to analyze PostgreSQL query execution plans within Grafana dashboards. Currently, EXPLAIN output is displayed as raw text or JSON, making it difficult to:

- Identify performance bottlenecks quickly
- Understand complex query execution flows
- Compare execution plans across time periods
- Share visual insights with team members in existing Grafana dashboards

The solution must work in restricted Grafana environments (Grafana Cloud, enterprise installations) where external resources are blocked by Content Security Policy (CSP).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Visualize JSON EXPLAIN Output (Priority: P1)

A database administrator runs a query with EXPLAIN (FORMAT JSON) through a Grafana data source panel and needs to see the execution plan visualized as an interactive tree diagram showing node types, costs, and timings.

**Why this priority**: This is the core value proposition - converting raw JSON data into actionable visual insights. Without this, the plugin has no purpose.

**Independent Test**: Can be fully tested by configuring a Grafana panel with JSON EXPLAIN output from any data source and verifying the PEV2 visualization renders correctly with node details.

**Acceptance Scenarios**:

1. **Given** a Grafana panel configured with the plugin, **When** the data source returns EXPLAIN (FORMAT JSON) output, **Then** the panel displays an interactive tree visualization with all plan nodes
2. **Given** a visualized plan, **When** user hovers over a node, **Then** detailed information (cost, rows, timing) appears in a tooltip
3. **Given** a visualized plan, **When** user clicks on a node, **Then** the node expands/collapses to show/hide child nodes
4. **Given** multiple query results, **When** data refreshes, **Then** the visualization updates without page reload

---

### User Story 2 - Visualize Plain Text EXPLAIN Output (Priority: P2)

A developer running legacy monitoring queries receives EXPLAIN output in plain text format and needs the plugin to automatically convert it to JSON and display the visualization without manual intervention.

**Why this priority**: Many existing Grafana dashboards and queries use plain text EXPLAIN format. Supporting this eliminates migration friction.

**Independent Test**: Can be tested independently by providing plain text EXPLAIN output to the panel and verifying automatic format detection and conversion to visualization.

**Acceptance Scenarios**:

1. **Given** plain text EXPLAIN output, **When** the panel receives the data, **Then** the plugin automatically detects the format and converts it to JSON
2. **Given** converted data, **When** visualization renders, **Then** the output matches what would be displayed for equivalent JSON input
3. **Given** ambiguous data format, **When** auto-detection fails, **Then** user can manually force JSON mode via panel options

---

### User Story 3 - Configure Panel Display Options (Priority: P3)

A dashboard designer wants to customize the visualization appearance (font size, dark mode) to match their Grafana theme and improve readability for their team.

**Why this priority**: Enhances user experience but doesn't affect core functionality. Can be added after basic visualization works.

**Independent Test**: Can be tested by adjusting panel options and verifying visual changes apply immediately without data re-fetch.

**Acceptance Scenarios**:

1. **Given** a working visualization, **When** user adjusts fontSize slider, **Then** all text in the visualization scales proportionally
2. **Given** a light Grafana theme, **When** user enables darkMode option, **Then** visualization colors invert to dark theme palette
3. **Given** custom field mapping, **When** user sets planFieldName to "query_plan", **Then** plugin reads data from that field instead of default "plan"

---

### User Story 4 - Handle Data Source Flexibility (Priority: P1)

An operations engineer monitors query performance from multiple sources (direct PostgreSQL, Prometheus metrics with JSON payloads, pre-stored JSON documents) and needs the plugin to work with any Grafana data source.

**Why this priority**: Critical for adoption - users should not be locked into specific data sources. This is a primary requirement.

**Independent Test**: Can be tested by configuring panels with different data sources (PostgreSQL, JSON API, TestData, Prometheus) and verifying visualization works identically.

**Acceptance Scenarios**:

1. **Given** a PostgreSQL data source query returning EXPLAIN output, **When** panel renders, **Then** visualization displays correctly
2. **Given** a JSON API data source, **When** response contains plan field, **Then** plugin extracts and visualizes the plan
3. **Given** a Prometheus metric with JSON payload, **When** panel parses the data, **Then** plugin handles the nested structure correctly
4. **Given** TestData data source with mock EXPLAIN output, **When** testing the panel, **Then** visualization renders for development/testing

---

### User Story 5 - Automatic Panel Resizing (Priority: P3)

A dashboard viewer adjusts browser window size or switches between desktop and mobile views and needs the visualization to resize gracefully without truncation or scrolling issues.

**Why this priority**: Important for professional dashboards but not blocking core functionality. Enhances usability after MVP.

**Independent Test**: Can be tested by resizing browser window and Grafana panel dimensions and verifying visualization scales appropriately.

**Acceptance Scenarios**:

1. **Given** a rendered visualization, **When** panel width decreases, **Then** visualization scales down while maintaining aspect ratio
2. **Given** a narrow panel, **When** content cannot fit, **Then** horizontal scrolling appears
3. **Given** panel height change, **When** visualization adjusts, **Then** vertical spacing redistributes to use available space

---

### Edge Cases

- What happens when EXPLAIN output contains no data (empty plan)?
  - Display clear message: "No execution plan data available"
- What happens when data source returns malformed JSON?
  - Display error message with validation details and suggest checking query format
- What happens when plain text EXPLAIN parser fails?
  - Fall back to raw text display with error banner: "Unable to parse plan format"
- What happens when data source field name doesn't match planFieldName option?
  - Display configuration error: "Field '[fieldName]' not found. Check planFieldName setting."
- What happens when panel receives multiple rows of data?
  - Use first row by default, log warning if multiple rows detected
- What happens when EXPLAIN output is extremely large (>10,000 nodes)?
  - Render with performance warning, suggest filtering query scope
- What happens when user switches data sources while viewing a visualization?
  - Clear previous visualization, show loading state, render new data
- What happens when CSP blocks Vue component loading?
  - Display error: "Plugin assets failed to load. Check CSP configuration."
- What happens when PEV2 library throws runtime error?
  - Catch error, display: "Visualization error: [error message]", log to browser console

## Requirements _(mandatory)_

### Functional Requirements

#### Core Visualization

- **FR-001**: Plugin MUST accept EXPLAIN output in JSON format (PostgreSQL EXPLAIN FORMAT JSON)
- **FR-002**: Plugin MUST accept EXPLAIN output in plain text format (PostgreSQL default EXPLAIN)
- **FR-003**: Plugin MUST automatically detect whether input is JSON or plain text format
- **FR-004**: Plugin MUST convert plain text EXPLAIN to JSON format using PEV2 parser
- **FR-005**: Plugin MUST render execution plan as interactive tree visualization using PEV2 library
- **FR-006**: Visualization MUST display node types (Seq Scan, Index Scan, Hash Join, etc.)
- **FR-007**: Visualization MUST display cost estimates (startup cost, total cost) for each node
- **FR-008**: Visualization MUST display row estimates (planned rows, actual rows when available)
- **FR-009**: Visualization MUST display timing information when available (actual time, loops)
- **FR-010**: Visualization MUST support expanding/collapsing nodes interactively
- **FR-011**: Visualization MUST show node details on hover/click

#### Data Source Integration

- **FR-012**: Plugin MUST work with PostgreSQL data sources
- **FR-013**: Plugin MUST work with JSON API data sources
- **FR-014**: Plugin MUST work with Prometheus data sources returning JSON payloads
- **FR-015**: Plugin MUST work with any Grafana data source that returns structured data
- **FR-016**: Plugin MUST extract plan data from configurable field name (default: "plan")
- **FR-017**: Plugin MUST handle single-row query results containing plan data
- **FR-018**: Plugin MUST handle multi-row results by using the first row

#### Panel Configuration

- **FR-019**: Panel options MUST include planFieldName setting (string input, default "plan")
- **FR-020**: Panel options MUST include forceJsonMode toggle (boolean, default false)
- **FR-021**: Panel options MUST include fontSize setting (slider, range 10-24px, default 14px)
- **FR-022**: Panel options MUST include darkMode toggle (boolean, default follows Grafana theme)
- **FR-023**: Changes to panel options MUST apply immediately without data re-fetch
- **FR-024**: Panel options MUST persist when dashboard is saved

#### Error Handling

- **FR-025**: Plugin MUST display user-friendly error message when plan data is invalid
- **FR-026**: Plugin MUST display specific error when field name is not found in data
- **FR-027**: Plugin MUST display specific error when JSON parsing fails
- **FR-028**: Plugin MUST display specific error when text-to-JSON conversion fails
- **FR-029**: Plugin MUST display specific error when PEV2 rendering fails
- **FR-030**: All error messages MUST include suggested resolution steps
- **FR-031**: All errors MUST log detailed information to browser console for debugging

#### Security & Deployment

- **FR-032**: Plugin MUST bundle all Vue 3 dependencies locally (no CDN links)
- **FR-033**: Plugin MUST bundle all PEV2 library files locally
- **FR-034**: Plugin MUST comply with strict Content Security Policy (CSP)
- **FR-035**: Plugin MUST not load external scripts at runtime
- **FR-036**: Plugin MUST not load external stylesheets at runtime
- **FR-037**: Plugin MUST work in Grafana Cloud environments
- **FR-038**: Plugin MUST work in enterprise Grafana installations with restricted CSP

#### Panel Behavior

- **FR-039**: Visualization MUST automatically resize when panel dimensions change
- **FR-040**: Panel MUST display loading indicator while fetching data
- **FR-041**: Panel MUST refresh visualization when data source updates
- **FR-042**: Panel MUST maintain visualization state (expanded nodes) during theme changes
- **FR-043**: Panel MUST clear previous visualization before rendering new data

#### Build & Distribution

- **FR-044**: Plugin MUST include plugin.json with correct metadata
- **FR-045**: Plugin MUST define plugin type as "panel"
- **FR-046**: Plugin MUST specify supported Grafana versions
- **FR-047**: Build process MUST bundle React components and dependencies
- **FR-048**: Build process MUST bundle Vue 3 runtime
- **FR-049**: Build process MUST bundle PEV2 library and assets
- **FR-050**: Build output MUST include signing metadata for Grafana plugin validation

### Non-Functional Requirements

#### Performance

- **NFR-001**: Visualization MUST render plans with up to 1,000 nodes in under 2 seconds
- **NFR-002**: Panel resize operations MUST complete in under 500ms
- **NFR-003**: Format detection MUST complete in under 100ms
- **NFR-004**: Text-to-JSON conversion MUST complete in under 1 second for plans up to 100KB

#### Compatibility

- **NFR-005**: Plugin MUST support Grafana versions 9.0 and above
- **NFR-006**: Plugin MUST work in Chrome, Firefox, Safari, and Edge browsers
- **NFR-007**: Plugin MUST be compatible with Grafana Cloud CSP policies
- **NFR-008**: Plugin MUST work on desktop and tablet screen sizes (minimum 768px width)

#### Usability

- **NFR-009**: Initial visualization MUST be comprehensible without documentation
- **NFR-010**: Error messages MUST be actionable and non-technical
- **NFR-011**: Panel options MUST have descriptive labels and help text
- **NFR-012**: Font sizes MUST scale proportionally across all visualization elements

#### Maintainability

- **NFR-013**: Code MUST separate React panel logic from Vue component mounting
- **NFR-014**: Build configuration MUST document bundling strategy for Vue components
- **NFR-015**: Plugin MUST include development setup documentation
- **NFR-016**: Plugin MUST include example queries for testing

### Key Entities

- **Execution Plan**: Complete query execution plan containing hierarchical nodes, overall statistics, and metadata. Contains planning time, execution time, and optimizer settings.

- **Plan Node**: Individual step in execution plan representing an operation (scan, join, aggregate, sort). Contains node type, cost estimates, row estimates, timing data, filter conditions, and references to child nodes.

- **Panel Configuration**: User-configurable settings for visualization behavior. Contains planFieldName, forceJsonMode, fontSize, darkMode flags.

- **Data Frame**: Grafana's internal data structure containing query results. Contains fields (columns), values (rows), and metadata. Plugin extracts plan data from specified field.

- **Visualization State**: Current state of rendered plan. Contains expanded/collapsed node IDs, selected node, zoom level, scroll position.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can visualize any valid PostgreSQL EXPLAIN output (JSON or text) within 3 seconds of panel load
- **SC-002**: Panel correctly renders execution plans containing up to 1,000 nodes without performance degradation
- **SC-003**: 95% of format detection operations correctly identify JSON vs plain text without manual intervention
- **SC-004**: Plugin successfully deploys to Grafana Cloud and enterprise environments without CSP violations
- **SC-005**: Users can identify the most expensive query operation within 10 seconds of viewing the visualization
- **SC-006**: Panel options changes apply immediately without requiring dashboard refresh
- **SC-007**: Error messages enable users to resolve configuration issues in under 2 minutes
- **SC-008**: Plugin bundle size remains under 2MB to ensure fast dashboard loading
- **SC-009**: Visualization maintains readability across font sizes from 10px to 24px
- **SC-010**: Panel resizes smoothly across desktop screen sizes (1920px to 1280px width) in under 500ms

## Architecture Overview

### Component Structure

The plugin follows Grafana's standard panel plugin architecture with special handling for Vue component integration:

**Grafana Panel Layer** (React + TypeScript)

- Panel component receives data frames from Grafana
- Extracts plan data from configured field
- Detects and converts format as needed
- Manages panel options and lifecycle
- Creates Vue mounting point (div container)

**Vue Integration Layer**

- Mounts Vue 3 application inside React-managed div
- Passes plan data as props to Vue components
- Handles Vue lifecycle (mount, update, unmount)
- Bridges React state changes to Vue reactivity

**PEV2 Visualization Layer** (Vue 3)

- Receives parsed JSON plan data
- Renders interactive tree visualization
- Handles user interactions (hover, click, expand)
- Applies styling based on panel options

**Data Flow**

1. Grafana data source → Panel component receives DataFrame
2. Panel extracts field value using planFieldName
3. Format detector analyzes input (JSON vs text)
4. Parser converts text to JSON if needed
5. Validator confirms JSON structure
6. Vue mount function receives validated plan
7. PEV2 component renders visualization
8. User interactions update Vue state
9. Panel resize triggers Vue re-render

### Bundle Strategy

All dependencies must be bundled locally to satisfy CSP requirements:

**React Bundle** (Grafana provides)

- React runtime (provided by Grafana)
- TypeScript definitions
- Grafana UI components

**Vue Bundle** (plugin must bundle)

- Vue 3 runtime (runtime-only build)
- Vue reactivity system
- Vue compiler (if needed for templates)

**PEV2 Bundle** (plugin must bundle)

- PEV2 Vue components
- PEV2 parser utilities
- PEV2 styles (inlined CSS)
- PEV2 assets (icons, fonts)

**Build Output Structure**

```
dist/
  module.js          (Panel React component + bundled dependencies)
  module.js.map
  plugin.json        (Metadata)
  README.md
  img/               (Plugin screenshots/logo)
  CHANGELOG.md
```

### Security Constraints

**Content Security Policy Compliance**

- No `script-src` external domains
- No `style-src` external domains
- No `connect-src` to CDNs
- All assets served from plugin directory

**Bundle Requirements**

- Vue 3 runtime must be inlined
- PEV2 library must be inlined
- All CSS must be inlined or bundled
- No dynamic imports from external URLs

### Panel Lifecycle

**Initialization**

1. Panel component mounts
2. Create Vue app container (div ref)
3. Load Vue runtime from bundle
4. Initialize PEV2 component
5. Mount Vue app to container div

**Data Update**

1. Grafana calls onOptionsChange or data prop updates
2. Extract plan data from new DataFrame
3. Detect/convert format if needed
4. Update Vue app props
5. PEV2 re-renders with new data

**Resize**

1. Grafana calls onResize with new dimensions
2. Update container div dimensions
3. Trigger Vue reactive resize
4. PEV2 recalculates layout

**Cleanup**

1. Panel component unmounts
2. Unmount Vue app
3. Destroy Vue instance
4. Clear container div

### Error States

**State 1: No Data**

- Trigger: DataFrame is empty or undefined
- Display: "No data available. Configure a query to return EXPLAIN output."
- Action: User should configure panel query

**State 2: Field Not Found**

- Trigger: Specified planFieldName doesn't exist in DataFrame
- Display: "Field '[name]' not found. Available fields: [list]. Update planFieldName in panel options."
- Action: User should correct field name setting

**State 3: Invalid Format**

- Trigger: Data is neither valid JSON nor parseable text
- Display: "Invalid EXPLAIN format. Expected JSON or plain text EXPLAIN output."
- Action: User should verify query returns EXPLAIN data

**State 4: Parse Error**

- Trigger: Text-to-JSON conversion fails
- Display: "Unable to parse EXPLAIN text format: [error]. Try EXPLAIN (FORMAT JSON) or enable forceJsonMode."
- Action: User should modify query or settings

**State 5: Render Error**

- Trigger: PEV2 component throws exception
- Display: "Visualization error: [message]. Check browser console for details."
- Action: User should report issue with query plan sample

**State 6: CSP Violation**

- Trigger: Browser blocks resource load
- Display: "Plugin assets blocked by security policy. Contact Grafana administrator."
- Action: Admin should verify plugin installation

## Assumptions

- PostgreSQL EXPLAIN output format follows standard PostgreSQL documentation (versions 10+)
- Grafana version supports modern panel plugin SDK (v9.0+)
- Users have basic familiarity with PostgreSQL EXPLAIN commands
- PEV2 library API remains stable during development
- Grafana data sources return data in standard DataFrame format
- Browser localStorage is available for persisting panel preferences
- Grafana theme detection API is available for darkMode auto-detection

## Out of Scope

The following are explicitly excluded from this specification:

- Real-time query execution and EXPLAIN generation (plugin only visualizes existing EXPLAIN output)
- Query optimization recommendations or AI-powered suggestions
- Comparison of multiple execution plans side-by-side
- Export of visualizations as images or PDFs
- Historical plan storage or versioning
- Integration with query editors for direct EXPLAIN execution
- Support for non-PostgreSQL databases (MySQL, Oracle, SQL Server)
- Mobile phone screen sizes (below 768px width)
- Plugin backend components (fully frontend-only)
- Authentication or authorization (uses Grafana's existing security)

## Dependencies & Constraints

### External Dependencies

- Grafana platform (version 9.0+)
- PEV2 visualization library (bundled)
- Vue 3 framework (bundled)
- PostgreSQL data source (or compatible alternative)

### Technical Constraints

- Must run entirely in browser (no backend server)
- Must comply with strict CSP policies
- Bundle size should not exceed 2MB
- Must work without internet connectivity after initial load
- Must use Grafana SDK APIs for panel integration

### Assumptions

- Grafana plugin signing infrastructure is available for distribution
- Development environment has Node.js 18+ and npm/yarn
- Build process has access to npm registry for development dependencies
- Target Grafana instances allow custom plugin installation
