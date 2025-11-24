# Implementation Plan: Grafana PostgreSQL Explain Visualizer Panel Plugin

**Branch**: `001-grafana-explain-panel` | **Date**: 2025-11-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-grafana-explain-panel/spec.md`

## Summary

Develop a Grafana panel plugin that visualizes PostgreSQL EXPLAIN output using the PEV2 (Postgres EXPLAIN Visualizer 2) library. The plugin will accept EXPLAIN data in both JSON and plain text formats, automatically detect the format, convert text to JSON when needed, and render an interactive tree visualization. The implementation requires bootstrapping with @grafana/create-plugin, integrating Vue 3 runtime with React-based Grafana panel architecture, bundling all dependencies locally to comply with strict Content Security Policy requirements, and providing comprehensive error handling for production use.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode enabled, targeting ES2020+  
**Primary Dependencies**: 
- @grafana/data, @grafana/ui, @grafana/runtime (Grafana Plugin SDK)
- React 18.x (provided by Grafana)
- Vue 3.x runtime (bundled)
- PEV2 library (pev2 npm package, bundled)
- @emotion/css for styling
- webpack 5 for bundling

**Storage**: N/A (fully client-side plugin, no persistent storage)  
**Testing**:
- The assistant may use Docker to run tests, tools, and commands.
- The assistant may generate Dockerfiles, docker-compose.yml files, and test containers.
- The assistant may assume that `docker` and `docker compose` are available.
- The assistant must ensure all CLI commands work on Linux-based Docker containers.

**Target Platform**: Browser-based (Chrome, Firefox, Safari, Edge), Grafana 10.4.0+, works in CSP-restricted environments (Grafana Cloud, enterprise installations)  
**Project Type**: Single project (Grafana panel plugin)  
**Performance Goals**: 
- Render plans with 1,000 nodes in <2 seconds
- Panel resize operations in <500ms
- Format detection in <100ms
- Text-to-JSON conversion in <1 second for 100KB plans
- Bundle size <2MB

**Constraints**: 
- All dependencies must be bundled (no CDN usage)
- Strict Content Security Policy compliance
- No external resource loading at runtime
- Must work in air-gapped/offline environments
- React-Vue interop for PEV2 integration
- No unsafe DOM manipulation patterns

**Scale/Scope**: 
- Single panel plugin
- ~10-15 source files
- Support EXPLAIN plans up to 10,000 nodes
- 4 panel configuration options
- 6 error states to handle

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Security First ✅
- **Status**: PASS
- **Evidence**: Plan includes sanitization requirements, no unsafe HTML rendering, all dependencies bundled, CSP compliance enforced
- **Notes**: Error handling sections include validation of PostgreSQL EXPLAIN JSON before rendering

### II. Deterministic & Production-Grade ✅
- **Status**: PASS
- **Evidence**: TypeScript strict mode required, all code must compile without modification, comprehensive testing plan included
- **Notes**: Phase 2 includes unit tests, integration tests, and rendering tests

### III. Bundled Dependencies ✅
- **Status**: PASS
- **Evidence**: Vue 3 and PEV2 must be bundled via webpack, no CDN usage, works in air-gapped environments
- **Notes**: Build configuration explicitly addresses bundling strategy

### IV. Grafana Plugin Standards ✅
- **Status**: PASS
- **Evidence**: Uses @grafana/create-plugin bootstrap, follows official SDK patterns, plugin.json schema compliance
- **Notes**: Architecture leverages @grafana/data, @grafana/ui, @grafana/runtime APIs

### V. React-Based UI ✅
- **Status**: PASS
- **Evidence**: React panel component manages Vue mounting point, uses @grafana/ui components for options UI
- **Notes**: React-Vue bridge pattern documented in architecture section

### VI. Clear Architecture ✅
- **Status**: PASS
- **Evidence**: Separation of data extraction, format detection, parsing, and visualization layers clearly defined
- **Notes**: Component responsibilities explicitly documented in spec architecture section

### VII. Type Safety ✅
- **Status**: PASS
- **Evidence**: TypeScript strict mode, explicit interfaces for PostgreSQL EXPLAIN JSON structures, typed panel options
- **Notes**: types.ts will define all data contracts

### VIII. PEV2 Integration ✅
- **Status**: PASS
- **Evidence**: PEV2 bundled locally, React wrapper encapsulates Vue component, Grafana-specific concerns handled in wrapper
- **Notes**: Integration layer design preserves PEV2 core logic while adding Grafana compatibility

### IX. Error Handling ✅
- **Status**: PASS
- **Evidence**: 6 error states defined with user-friendly messages, error boundaries at component level, logging for debugging
- **Notes**: Spec includes detailed error scenarios with resolution guidance

### X. Performance ✅
- **Status**: PASS
- **Evidence**: Performance goals defined (1000 nodes <2s, resize <500ms), optimization strategies planned
- **Notes**: React.memo and virtualization mentioned for large plans

**OVERALL GATE STATUS**: ✅ PASS - All constitution principles satisfied. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-grafana-explain-panel/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - dependency decisions, bundling strategies
├── data-model.md        # Phase 1 output - PostgreSQL EXPLAIN JSON structure
├── quickstart.md        # Phase 1 output - setup and testing guide
├── contracts/           # Phase 1 output - TypeScript interfaces
│   ├── plan-types.ts    # PostgreSQL EXPLAIN JSON type definitions
│   ├── panel-options.ts # Panel configuration interface
│   └── error-types.ts   # Error state type definitions
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ExplainPanel.tsx           # Main panel component (replaces SimplePanel.tsx)
│   ├── VueMount.tsx               # React wrapper for Vue app mounting
│   ├── ErrorBoundary.tsx          # Error boundary component
│   ├── LoadingSpinner.tsx         # Loading state component
│   └── ErrorDisplay.tsx           # Error state display component
├── services/
│   ├── dataExtractor.ts           # Extract plan from DataFrame
│   ├── formatDetector.ts          # Detect JSON vs plain text
│   ├── textParser.ts              # Convert text EXPLAIN to JSON using PEV2
│   ├── planValidator.ts           # Validate EXPLAIN JSON structure
│   └── vueBootstrap.ts            # Vue 3 app initialization and lifecycle
├── utils/
│   ├── constants.ts               # Default values, field names
│   └── logger.ts                  # Console logging utilities
├── types/
│   ├── panel-options.ts           # Panel configuration types
│   ├── plan-types.ts              # PostgreSQL EXPLAIN types
│   └── error-types.ts             # Error state types
├── styles/
│   └── pev2-overrides.css         # Theme-aware PEV2 style overrides
├── module.ts                      # Plugin registration (existing, modified)
├── plugin.json                    # Plugin metadata (existing, updated)
└── README.md                      # Plugin documentation (existing, updated)

tests/
├── unit/
│   ├── dataExtractor.test.ts
│   ├── formatDetector.test.ts
│   ├── textParser.test.ts
│   └── planValidator.test.ts
├── integration/
│   ├── panel-render.test.tsx      # Full panel rendering tests
│   └── vue-mount.test.tsx         # React-Vue integration tests
└── fixtures/
    ├── sample-json-plan.json      # Test EXPLAIN JSON data
    └── sample-text-plan.txt       # Test EXPLAIN text data

provisioning/
└── dashboards/
    └── explain-example.json       # Example dashboard with plugin

dist/                              # Build output (created by webpack)
├── module.js
├── module.js.map
├── plugin.json
└── img/
```

**Structure Decision**: Single project structure selected. This is a Grafana panel plugin with no backend components. All functionality runs client-side in the browser. Source code organized by technical layers (components, services, types) following Grafana plugin conventions. The Vue 3 runtime and PEV2 library will be bundled into module.js via webpack configuration.

## Complexity Tracking

**No constitution violations requiring justification.**

This implementation follows all constitutional principles without requiring exceptions or workarounds.

---

## Phase 0: Outline & Research

### Research Tasks

Phase 0 focuses on resolving technical unknowns and establishing best practices for the implementation.

#### Research 0.1: Vue 3 + React Integration Strategy
**Question**: How to properly mount and manage Vue 3 applications within React components in Grafana context?
**Investigation Areas**:
- Vue 3 createApp API for manual mounting
- React useEffect lifecycle for Vue app initialization
- React useRef for DOM element management
- Prop passing from React to Vue reactive system
- Cleanup strategies for unmounting Vue apps

#### Research 0.2: PEV2 Library Integration
**Question**: How to integrate PEV2 (Vue 3 based) with bundled dependencies?
**Investigation Areas**:
- PEV2 npm package structure and entry points
- Required PEV2 exports (components, parser utilities)
- PEV2 CSS/styling requirements
- Text EXPLAIN parsing API in PEV2
- Vue component props interface for PEV2

#### Research 0.3: Webpack Bundling for Vue + PEV2
**Question**: How to configure webpack to bundle Vue 3 runtime and PEV2 without CDN?
**Investigation Areas**:
- Grafana plugin webpack configuration customization
- Vue 3 runtime-only build vs full build
- CSS/asset handling for PEV2 styles
- Source map configuration for debugging
- Bundle size optimization techniques

#### Research 0.4: Grafana DataFrame to EXPLAIN Plan Extraction
**Question**: What is the exact structure of Grafana DataFrame and how to extract string/JSON fields?
**Investigation Areas**:
- DataFrame field types and value access patterns
- Handling multiple rows vs single row scenarios
- Field name resolution (configurable field name)
- String field vs JSON field handling
- Time series data vs table data differences

#### Research 0.5: PostgreSQL EXPLAIN JSON Format
**Question**: What is the complete TypeScript type definition for PostgreSQL EXPLAIN JSON?
**Investigation Areas**:
- PostgreSQL 10-16 EXPLAIN (FORMAT JSON) output structure
- Node types and their properties
- Optional vs required fields
- Nested plan structure (parent-child relationships)
- Timing and cost fields variability

#### Research 0.6: Error Handling Patterns in Grafana Plugins
**Question**: What are the standard error handling patterns for Grafana panel plugins?
**Investigation Areas**:
- React Error Boundary implementation with @grafana/ui
- PanelDataErrorView usage scenarios
- Console logging best practices
- User-friendly error message display
- Error state persistence during panel refresh

### Research Output

**Output File**: `specs/001-grafana-explain-panel/research.md`

**Format**:
```markdown
# Research Findings: Grafana PostgreSQL Explain Visualizer

## Decision 0.1: Vue 3 + React Integration
- **Decision**: [chosen approach]
- **Rationale**: [why chosen]
- **Alternatives Considered**: [other options evaluated]
- **Implementation Guide**: [code patterns to use]

## Decision 0.2: PEV2 Library Integration
[same format]

## Decision 0.3: Webpack Bundling
[same format]

## Decision 0.4: DataFrame Extraction
[same format]

## Decision 0.5: EXPLAIN JSON Types
[same format]

## Decision 0.6: Error Handling
[same format]
```

---

## Phase 1: Design & Contracts

### Phase 1.1: Data Model Definition

**Output File**: `specs/001-grafana-explain-panel/data-model.md`

**Content Structure**:

#### Entity: Execution Plan
```typescript
interface ExecutionPlan {
  Plan: PlanNode;
  "Planning Time"?: number;
  "Execution Time"?: number;
  Triggers?: Trigger[];
}
```
**Description**: Root container for complete PostgreSQL query execution plan
**Source**: PostgreSQL EXPLAIN (FORMAT JSON) output
**Validation Rules**: 
- Plan field is required
- Must be valid JSON structure
- Node hierarchy must be consistent

#### Entity: Plan Node
```typescript
interface PlanNode {
  "Node Type": string;
  "Startup Cost": number;
  "Total Cost": number;
  "Plan Rows": number;
  "Plan Width": number;
  "Actual Startup Time"?: number;
  "Actual Total Time"?: number;
  "Actual Rows"?: number;
  "Actual Loops"?: number;
  Plans?: PlanNode[];
  // ... additional fields
}
```
**Description**: Individual operation in execution plan tree
**Relationships**: Parent-child via Plans array
**State Transitions**: Expanded/Collapsed in UI

#### Entity: Panel Options
```typescript
interface PanelOptions {
  planFieldName: string;        // default: "plan"
  forceJsonMode: boolean;        // default: false
  fontSize: number;              // range: 10-24, default: 14
  darkMode: boolean;             // default: auto from theme
}
```
**Description**: User-configurable panel settings
**Validation Rules**:
- planFieldName must be non-empty string
- fontSize must be between 10 and 24
- Values persisted in dashboard JSON

#### Entity: Error State
```typescript
type ErrorType = 
  | "NO_DATA" 
  | "FIELD_NOT_FOUND" 
  | "INVALID_FORMAT" 
  | "PARSE_ERROR" 
  | "RENDER_ERROR" 
  | "CSP_VIOLATION";

interface ErrorState {
  type: ErrorType;
  message: string;
  details?: string;
  resolutionHint: string;
}
```
**Description**: Error classification and user guidance
**State Transitions**: Any state → Error state → Retry/Resolve

### Phase 1.2: API Contracts

**Output Directory**: `specs/001-grafana-explain-panel/contracts/`

#### Contract: plan-types.ts
```typescript
// Complete TypeScript interface definitions for PostgreSQL EXPLAIN JSON
// Based on Research 0.5 findings
export interface ExecutionPlan { /* ... */ }
export interface PlanNode { /* ... */ }
export interface Trigger { /* ... */ }
export type NodeType = "Seq Scan" | "Index Scan" | /* ... */;
```

#### Contract: panel-options.ts
```typescript
// Panel configuration interface matching FR-019 through FR-024
export interface PanelOptions { /* ... */ }
export const DEFAULT_OPTIONS: PanelOptions = { /* ... */ };
```

#### Contract: error-types.ts
```typescript
// Error state types matching FR-025 through FR-031
export type ErrorType = /* ... */;
export interface ErrorState { /* ... */ }
export const ERROR_MESSAGES: Record<ErrorType, string> = { /* ... */ };
```

### Phase 1.3: Quickstart Guide

**Output File**: `specs/001-grafana-explain-panel/quickstart.md`

**Content**:
- Development environment setup
- Building the plugin
- Loading plugin in local Grafana
- Example PostgreSQL queries
- Testing with sample data
- Troubleshooting common issues

### Phase 1.4: Agent Context Update

Run the agent context update script to add technology information:

```powershell
.specify\scripts\powershell\update-agent-context.ps1 -AgentType copilot
```

This will update the Copilot-specific context file with:
- TypeScript + React + Vue 3 stack
- Grafana plugin development patterns
- PEV2 integration notes
- Webpack bundling configuration

---

## Phase 2: Step-by-Step Implementation Plan

This section provides the detailed 14-step development workflow requested.

### Step 1: Bootstrap Plugin with @grafana/create-plugin

**Objective**: Initialize Grafana panel plugin structure with official tooling.

**Actions**:
1. Run `npx @grafana/create-plugin@latest` (if starting fresh) or verify existing structure
2. Select "panel" plugin type
3. Configure plugin metadata:
   - Name: "Postgres Explain Visualizer"
   - ID: "cybertec-pev-panel"
   - Organization: "Cybertec"
4. Verify generated structure includes:
   - `src/` directory with panel component
   - `plugin.json` with correct metadata
   - `package.json` with Grafana dependencies
   - `.config/` directory with webpack config
   - `tsconfig.json` with strict mode

**Validation**:
- `npm install` completes without errors
- `npm run build` produces `dist/module.js`
- `npm run dev` starts development server

**Output Files**:
- `package.json` (updated dependencies)
- `.config/webpack/webpack.config.ts` (base configuration)
- `src/plugin.json` (plugin metadata)

**Constitution Alignment**: Principle IV (Grafana Plugin Standards)

---

### Step 2: Install and Bundle Vue 3 + PEV2

**Objective**: Add Vue 3 runtime and PEV2 library to project dependencies and configure webpack bundling.

**Actions**:
1. Install dependencies:
   ```bash
   npm install vue@^3.4.0 pev2@latest
   npm install --save-dev @types/node
   ```

2. Modify `.config/webpack/webpack.config.ts`:
   ```typescript
   // Add Vue alias to resolve runtime-only build
   resolve: {
     alias: {
       vue: 'vue/dist/vue.runtime.esm-bundler.js'
     }
   }
   
   // Configure DefinePlugin for Vue feature flags
   plugins: [
     new DefinePlugin({
       __VUE_OPTIONS_API__: false,
       __VUE_PROD_DEVTOOLS__: false,
     })
   ]
   
   // Ensure CSS is bundled
   module: {
     rules: [
       {
         test: /\.css$/,
         use: ['style-loader', 'css-loader']
       }
     ]
   }
   ```

3. Verify PEV2 assets are included in bundle

**Validation**:
- `npm run build` includes Vue and PEV2 in output
- `dist/module.js` size is < 2MB
- No external CDN references in bundle
- Source maps generated for debugging

**Output Files**:
- `package.json` (updated dependencies)
- `.config/webpack/webpack.config.ts` (modified)

**Constitution Alignment**: Principles III (Bundled Dependencies), IV (Grafana Standards)

---

### Step 3: Create React Panel Component

**Objective**: Build main panel component that receives Grafana data and manages Vue mounting.

**Actions**:
1. Create `src/components/ExplainPanel.tsx`:
   ```typescript
   import React, { useRef, useEffect } from 'react';
   import { PanelProps } from '@grafana/data';
   import { PanelOptions } from '../types/panel-options';
   
   export const ExplainPanel: React.FC<PanelProps<PanelOptions>> = ({
     options,
     data,
     width,
     height,
   }) => {
     const vueContainerRef = useRef<HTMLDivElement>(null);
     
     // Vue app lifecycle managed here
     useEffect(() => {
       // Mount Vue app (implemented in Step 7)
     }, [data, options]);
     
     return (
       <div ref={vueContainerRef} style={{ width, height }} />
     );
   };
   ```

2. Update `src/module.ts` to use ExplainPanel
3. Remove old SimplePanel.tsx

**Validation**:
- Component renders empty container
- Receives data prop from Grafana
- Width/height props applied correctly
- Component re-renders on data updates

**Output Files**:
- `src/components/ExplainPanel.tsx` (new)
- `src/module.ts` (modified)

**Constitution Alignment**: Principles V (React-Based UI), VI (Clear Architecture)

---

### Step 4: Implement Plan Extraction from DataFrame

**Objective**: Extract EXPLAIN plan data from Grafana DataFrame structure.

**Actions**:
1. Create `src/services/dataExtractor.ts`:
   ```typescript
   import { PanelData } from '@grafana/data';
   import { PanelOptions } from '../types/panel-options';
   
   export function extractPlanData(
     data: PanelData,
     options: PanelOptions
   ): string | null {
     // 1. Check if data.series exists and has length
     if (!data.series || data.series.length === 0) {
       return null;
     }
     
     // 2. Get first series (use first row by default)
     const series = data.series[0];
     
     // 3. Find field by name (options.planFieldName)
     const field = series.fields.find(
       f => f.name === options.planFieldName
     );
     
     if (!field) {
       throw new Error(`Field "${options.planFieldName}" not found`);
     }
     
     // 4. Extract first value
     const value = field.values.get(0);
     
     // 5. Return as string
     return String(value);
   }
   ```

2. Add comprehensive error handling
3. Handle multiple rows (use first, log warning)
4. Support both string and object field types

**Validation**:
- Unit tests with sample DataFrames
- Handles missing field gracefully
- Handles empty data gracefully
- Logs warnings for edge cases

**Output Files**:
- `src/services/dataExtractor.ts` (new)
- `tests/unit/dataExtractor.test.ts` (new)

**Constitution Alignment**: Principles VII (Type Safety), IX (Error Handling)

---

### Step 5: Implement Auto-Detection of JSON vs Text

**Objective**: Detect whether EXPLAIN output is JSON or plain text format.

**Actions**:
1. Create `src/services/formatDetector.ts`:
   ```typescript
   export type ExplainFormat = 'json' | 'text' | 'unknown';
   
   export function detectFormat(input: string): ExplainFormat {
     // 1. Trim whitespace
     const trimmed = input.trim();
     
     // 2. Check for JSON format
     if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
       try {
         JSON.parse(trimmed);
         return 'json';
       } catch {
         return 'unknown';
       }
     }
     
     // 3. Check for text EXPLAIN patterns
     const textPatterns = [
       /^Seq Scan/,
       /^Index Scan/,
       /^Bitmap Heap Scan/,
       /->.*\(cost=/,
     ];
     
     const isText = textPatterns.some(pattern => pattern.test(trimmed));
     return isText ? 'text' : 'unknown';
   }
   ```

2. Handle edge cases (empty, whitespace-only, malformed)
3. Performance optimization (< 100ms for 100KB input)

**Validation**:
- Unit tests with JSON samples
- Unit tests with text samples
- Unit tests with malformed input
- Performance benchmark

**Output Files**:
- `src/services/formatDetector.ts` (new)
- `tests/unit/formatDetector.test.ts` (new)

**Constitution Alignment**: Principles II (Deterministic), X (Performance)

---

### Step 6: Implement Text-to-JSON Parsing Using PEV2

**Objective**: Convert plain text EXPLAIN output to JSON format using PEV2 parser.

**Actions**:
1. Create `src/services/textParser.ts`:
   ```typescript
   import { parseTextPlan } from 'pev2'; // PEV2 parser utility
   import { ExecutionPlan } from '../types/plan-types';
   
   export function convertTextToJson(textPlan: string): ExecutionPlan {
     try {
       // Use PEV2's text parser
       const parsed = parseTextPlan(textPlan);
       
       // Validate structure
       if (!parsed || !parsed.Plan) {
         throw new Error('Invalid plan structure after parsing');
       }
       
       return parsed;
     } catch (error) {
       throw new Error(
         `Failed to parse text EXPLAIN: ${error.message}. ` +
         'Try using EXPLAIN (FORMAT JSON) or check plan format.'
       );
     }
   }
   ```

2. Add validation after parsing
3. Comprehensive error messages with resolution hints
4. Performance testing (< 1 second for 100KB input)

**Validation**:
- Unit tests with sample text EXPLAIN
- Error handling tests
- Performance benchmarks
- Integration test with real PostgreSQL output

**Output Files**:
- `src/services/textParser.ts` (new)
- `tests/unit/textParser.test.ts` (new)
- `tests/fixtures/sample-text-plan.txt` (new)

**Constitution Alignment**: Principles VIII (PEV2 Integration), IX (Error Handling)

---

### Step 7: Implement Vue Component Wrapper

**Objective**: Create React-to-Vue bridge that mounts Vue app with PEV2 component.

**Actions**:
1. Create `src/services/vueBootstrap.ts`:
   ```typescript
   import { createApp, App as VueApp } from 'vue';
   import { PevComponent } from 'pev2';
   import { ExecutionPlan } from '../types/plan-types';
   
   export function createPevApp(
     container: HTMLElement,
     plan: ExecutionPlan,
     options: { fontSize: number; darkMode: boolean }
   ): VueApp {
     const app = createApp({
       components: { PevComponent },
       data() {
         return {
           plan,
           fontSize: options.fontSize,
           darkMode: options.darkMode,
         };
       },
       template: `
         <PevComponent 
           :plan="plan" 
           :fontSize="fontSize"
           :darkMode="darkMode"
         />
       `,
     });
     
     app.mount(container);
     return app;
   }
   
   export function destroyPevApp(app: VueApp): void {
     app.unmount();
   }
   ```

2. Create `src/components/VueMount.tsx`:
   ```typescript
   import React, { useRef, useEffect, useState } from 'react';
   import { App as VueApp } from 'vue';
   import { createPevApp, destroyPevApp } from '../services/vueBootstrap';
   import { ExecutionPlan } from '../types/plan-types';
   
   interface Props {
     plan: ExecutionPlan;
     fontSize: number;
     darkMode: boolean;
     width: number;
     height: number;
   }
   
   export const VueMount: React.FC<Props> = ({
     plan,
     fontSize,
     darkMode,
     width,
     height,
   }) => {
     const containerRef = useRef<HTMLDivElement>(null);
     const [vueApp, setVueApp] = useState<VueApp | null>(null);
     
     // Mount Vue app
     useEffect(() => {
       if (!containerRef.current) return;
       
       const app = createPevApp(
         containerRef.current,
         plan,
         { fontSize, darkMode }
       );
       setVueApp(app);
       
       return () => {
         if (app) {
           destroyPevApp(app);
         }
       };
     }, []);
     
     // Update Vue app when props change
     useEffect(() => {
       if (vueApp) {
         // Update reactive data
         // (implementation depends on PEV2 API)
       }
     }, [plan, fontSize, darkMode, vueApp]);
     
     return (
       <div
         ref={containerRef}
         style={{ width, height, overflow: 'auto' }}
       />
     );
   };
   ```

**Validation**:
- Vue app mounts successfully
- Props update triggers Vue re-render
- Cleanup unmounts Vue properly
- No memory leaks on repeated mount/unmount

**Output Files**:
- `src/services/vueBootstrap.ts` (new)
- `src/components/VueMount.tsx` (new)
- `tests/integration/vue-mount.test.tsx` (new)

**Constitution Alignment**: Principles V (React-Based UI), VIII (PEV2 Integration)

---

### Step 8: Integrate PEV2.Plan Component

**Objective**: Wire up PEV2 visualization component with parsed plan data.

**Actions**:
1. Research PEV2 component API (from Phase 0)
2. Import PEV2 styles:
   ```typescript
   import 'pev2/dist/style.css';
   ```

3. Update VueMount to pass plan correctly
4. Handle PEV2-specific props (based on library docs)
5. Apply theme overrides:
   ```css
   /* src/styles/pev2-overrides.css */
   .pev2-container {
     font-family: var(--grafana-font-family);
   }
   
   .pev2-node {
     color: var(--grafana-text-primary);
   }
   ```

**Validation**:
- PEV2 renders execution plan tree
- Node interactions work (hover, click, expand)
- Styles match Grafana theme
- No console errors or warnings

**Output Files**:
- `src/services/vueBootstrap.ts` (modified)
- `src/styles/pev2-overrides.css` (new)

**Constitution Alignment**: Principles VIII (PEV2 Integration), V (React-Based UI)

---

### Step 9: Implement Panel Options UI

**Objective**: Create configuration interface for panel settings.

**Actions**:
1. Define types in `src/types/panel-options.ts`:
   ```typescript
   export interface PanelOptions {
     planFieldName: string;
     forceJsonMode: boolean;
     fontSize: number;
     darkMode: boolean;
   }
   
   export const DEFAULT_OPTIONS: PanelOptions = {
     planFieldName: 'plan',
     forceJsonMode: false,
     fontSize: 14,
     darkMode: false,
   };
   ```

2. Update `src/module.ts` with options builder:
   ```typescript
   export const plugin = new PanelPlugin<PanelOptions>(ExplainPanel)
     .setPanelOptions((builder) => {
       return builder
         .addTextInput({
           path: 'planFieldName',
           name: 'Plan Field Name',
           description: 'DataFrame field containing EXPLAIN output',
           defaultValue: DEFAULT_OPTIONS.planFieldName,
         })
         .addBooleanSwitch({
           path: 'forceJsonMode',
           name: 'Force JSON Mode',
           description: 'Skip auto-detection and treat input as JSON',
           defaultValue: DEFAULT_OPTIONS.forceJsonMode,
         })
         .addSliderInput({
           path: 'fontSize',
           name: 'Font Size',
           description: 'Visualization text size (px)',
           defaultValue: DEFAULT_OPTIONS.fontSize,
           settings: {
             min: 10,
             max: 24,
             step: 1,
           },
         })
         .addBooleanSwitch({
           path: 'darkMode',
           name: 'Dark Mode',
           description: 'Override theme detection',
           defaultValue: DEFAULT_OPTIONS.darkMode,
         });
     });
   ```

**Validation**:
- Options appear in panel editor
- Changes apply immediately
- Values persist when dashboard saved
- Validation enforces constraints

**Output Files**:
- `src/types/panel-options.ts` (new)
- `src/module.ts` (modified)

**Constitution Alignment**: Principles IV (Grafana Standards), V (React-Based UI)

---

### Step 10: Implement Resize Observer and Cleanup

**Objective**: Handle panel resizing and proper lifecycle cleanup.

**Actions**:
1. Update `src/components/ExplainPanel.tsx`:
   ```typescript
   export const ExplainPanel: React.FC<PanelProps<PanelOptions>> = ({
     options,
     data,
     width,
     height,
   }) => {
     const vueContainerRef = useRef<HTMLDivElement>(null);
     const vueAppRef = useRef<VueApp | null>(null);
     
     // Handle resize
     useEffect(() => {
       if (vueAppRef.current && vueContainerRef.current) {
         vueContainerRef.current.style.width = `${width}px`;
         vueContainerRef.current.style.height = `${height}px`;
         
         // Trigger PEV2 layout recalculation if API exists
         // (implementation depends on PEV2 API)
       }
     }, [width, height]);
     
     // Cleanup on unmount
     useEffect(() => {
       return () => {
         if (vueAppRef.current) {
           destroyPevApp(vueAppRef.current);
           vueAppRef.current = null;
         }
       };
     }, []);
     
     // ... rest of component
   };
   ```

2. Add ResizeObserver polyfill if needed
3. Debounce resize events for performance
4. Ensure cleanup prevents memory leaks

**Validation**:
- Panel resizes smoothly (< 500ms)
- No visual glitches during resize
- Memory usage stable after repeated resize
- Cleanup runs on component unmount

**Output Files**:
- `src/components/ExplainPanel.tsx` (modified)

**Constitution Alignment**: Principles X (Performance), II (Production-Grade)

---

### Step 11: Implement Full Error Handling

**Objective**: Add comprehensive error boundaries and user-friendly error displays.

**Actions**:
1. Create error types in `src/types/error-types.ts`:
   ```typescript
   export type ErrorType =
     | 'NO_DATA'
     | 'FIELD_NOT_FOUND'
     | 'INVALID_FORMAT'
     | 'PARSE_ERROR'
     | 'RENDER_ERROR'
     | 'CSP_VIOLATION';
   
   export interface ErrorState {
     type: ErrorType;
     message: string;
     details?: string;
     resolutionHint: string;
   }
   
   export const ERROR_MESSAGES: Record<ErrorType, ErrorState> = {
     NO_DATA: {
       type: 'NO_DATA',
       message: 'No data available',
       resolutionHint: 'Configure a query to return EXPLAIN output',
     },
     FIELD_NOT_FOUND: {
       type: 'FIELD_NOT_FOUND',
       message: 'Field not found in data',
       resolutionHint: 'Check planFieldName setting in panel options',
     },
     // ... other errors
   };
   ```

2. Create `src/components/ErrorDisplay.tsx`:
   ```typescript
   import React from 'react';
   import { Alert } from '@grafana/ui';
   import { ErrorState } from '../types/error-types';
   
   interface Props {
     error: ErrorState;
   }
   
   export const ErrorDisplay: React.FC<Props> = ({ error }) => {
     return (
       <Alert title={error.message} severity="error">
         <div>{error.resolutionHint}</div>
         {error.details && (
           <details style={{ marginTop: 8 }}>
             <summary>Technical details</summary>
             <pre>{error.details}</pre>
           </details>
         )}
       </Alert>
     );
   };
   ```

3. Create `src/components/ErrorBoundary.tsx`:
   ```typescript
   import React, { Component, ErrorInfo } from 'react';
   import { ErrorDisplay } from './ErrorDisplay';
   import { ErrorState } from '../types/error-types';
   
   interface Props {
     children: React.ReactNode;
   }
   
   interface State {
     error: ErrorState | null;
   }
   
   export class ErrorBoundary extends Component<Props, State> {
     state: State = { error: null };
     
     static getDerivedStateFromError(error: Error): State {
       return {
         error: {
           type: 'RENDER_ERROR',
           message: 'Visualization error',
           details: error.message,
           resolutionHint: 'Check browser console for details',
         },
       };
     }
     
     componentDidCatch(error: Error, errorInfo: ErrorInfo) {
       console.error('PEV Panel Error:', error, errorInfo);
     }
     
     render() {
       if (this.state.error) {
         return <ErrorDisplay error={this.state.error} />;
       }
       return this.props.children;
     }
   }
   ```

4. Update ExplainPanel to use ErrorBoundary
5. Add try-catch blocks in all service functions
6. Log errors to console with context

**Validation**:
- Each error type displays correctly
- Error messages are user-friendly
- Console logs include debugging context
- Error boundary catches React errors

**Output Files**:
- `src/types/error-types.ts` (new)
- `src/components/ErrorDisplay.tsx` (new)
- `src/components/ErrorBoundary.tsx` (new)
- `src/components/ExplainPanel.tsx` (modified)

**Constitution Alignment**: Principles IX (Error Handling), V (React-Based UI)

---

### Step 12: Implement Tests (Unit + Rendering)

**Objective**: Comprehensive test coverage for all functionality.

**Actions**:
1. **Unit Tests** - Create tests for each service:
   
   `tests/unit/dataExtractor.test.ts`:
   ```typescript
   import { extractPlanData } from '../../src/services/dataExtractor';
   
   describe('dataExtractor', () => {
     it('extracts plan from DataFrame', () => {
       const mockData = {
         series: [{
           fields: [{
             name: 'plan',
             values: { get: (i) => '{"Plan": {...}}' }
           }]
         }]
       };
       const result = extractPlanData(mockData, { planFieldName: 'plan' });
       expect(result).toBeTruthy();
     });
     
     it('throws error when field not found', () => {
       // ... test
     });
     
     it('handles empty data', () => {
       // ... test
     });
   });
   ```

2. **Integration Tests** - Test React-Vue integration:
   
   `tests/integration/panel-render.test.tsx`:
   ```typescript
   import { render, screen } from '@testing-library/react';
   import { ExplainPanel } from '../../src/components/ExplainPanel';
   
   describe('ExplainPanel', () => {
     it('renders Vue mount point', () => {
       const props = {
         data: mockDataFrame,
         options: DEFAULT_OPTIONS,
         width: 800,
         height: 600,
       };
       render(<ExplainPanel {...props} />);
       expect(screen.getByTestId('vue-container')).toBeInTheDocument();
     });
     
     it('displays error when no data', () => {
       // ... test
     });
   });
   ```

3. **Test Fixtures** - Create sample data:
   - `tests/fixtures/sample-json-plan.json`
   - `tests/fixtures/sample-text-plan.txt`
   - `tests/fixtures/mock-dataframe.ts`

4. **Coverage Requirements**:
   - Unit tests: > 80% coverage
   - Integration tests: Core user flows
   - Error scenarios: All 6 error types

**Validation**:
- `npm test` passes all tests
- Coverage meets thresholds
- Tests run in CI pipeline
- No flaky tests

**Output Files**:
- `tests/unit/*.test.ts` (multiple files)
- `tests/integration/*.test.tsx` (multiple files)
- `tests/fixtures/*` (test data)
- `jest.config.js` (test configuration)

**Constitution Alignment**: Principles II (Production-Grade), VII (Type Safety)

---

### Step 13: Build Plugin Zip Bundle

**Objective**: Create distributable plugin package for Grafana installation.

**Actions**:
1. Update `package.json` scripts:
   ```json
   {
     "scripts": {
       "build": "webpack -c ./.config/webpack/webpack.config.ts --env production",
       "build:dev": "webpack -c ./.config/webpack/webpack.config.ts --env development",
       "test": "jest --config jest.config.js",
       "sign": "grafana sign --rootUrls http://localhost:3000",
       "package": "npm run build && npm run sign && zip -r dist.zip dist/"
     }
   }
   ```

2. Verify build output:
   ```
   dist/
   ├── module.js          (bundled React + Vue + PEV2)
   ├── module.js.map
   ├── plugin.json
   ├── README.md
   ├── CHANGELOG.md
   └── img/
       └── logo.svg
   ```

3. Generate MANIFEST.txt (for signing)
4. Create dist.zip with all files

**Validation**:
- `npm run build` completes without errors
- Bundle size < 2MB
- No external dependencies in bundle
- Module.js includes Vue and PEV2
- Plugin installs in Grafana

**Output Files**:
- `dist/module.js` (built)
- `dist/plugin.json` (copied)
- `dist.zip` (packaged)
- `MANIFEST.txt` (generated)

**Constitution Alignment**: Principles III (Bundled Dependencies), IV (Grafana Standards)

---

### Step 14: Produce Example Dashboard JSON

**Objective**: Create sample dashboard demonstrating plugin usage.

**Actions**:
1. Create `provisioning/dashboards/explain-example.json`:
   ```json
   {
     "dashboard": {
       "title": "PostgreSQL Query Analysis",
       "panels": [
         {
           "type": "cybertec-pev-panel",
           "title": "EXPLAIN Visualization",
           "targets": [
             {
               "rawSql": "EXPLAIN (FORMAT JSON) SELECT * FROM users WHERE id = 1;"
             }
           ],
           "options": {
             "planFieldName": "QUERY PLAN",
             "fontSize": 14,
             "darkMode": false,
             "forceJsonMode": false
           }
         }
       ]
     }
   }
   ```

2. Add example queries:
   - Simple SELECT with sequential scan
   - JOIN with index scans
   - Complex query with aggregations
   - Subquery example

3. Document usage in README

**Validation**:
- Dashboard imports successfully
- Example queries return valid EXPLAIN data
- Plugin visualizes all examples correctly
- Documentation is clear

**Output Files**:
- `provisioning/dashboards/explain-example.json` (new)
- `README.md` (updated with examples)

**Constitution Alignment**: Principles IV (Grafana Standards), VI (Clear Architecture)

---

## Phase 2 Completion Criteria

The implementation plan is complete when:

✅ All 14 steps are documented with detailed actions
✅ Constitution check passed with no violations
✅ Technical context fully specified (no "NEEDS CLARIFICATION")
✅ Research tasks identified for Phase 0
✅ Data model entities defined
✅ API contracts specified
✅ Project structure documented
✅ Each step includes validation criteria
✅ Output files identified for each step
✅ Constitution principles referenced

**Next Command**: `/speckit.tasks` - This will generate the task breakdown for implementation based on this plan.
