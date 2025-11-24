# Research Findings: Grafana PostgreSQL Explain Visualizer

**Date**: 2025-11-24  
**Phase**: 0 - Outline & Research  
**Status**: Complete

This document consolidates research findings for all technical unknowns identified in the implementation plan.

---

## Decision 0.1: Vue 3 + React Integration Strategy

### Decision
Use React `useRef` + `useEffect` to manually mount Vue 3 apps into DOM nodes managed by React. The React component owns the container element lifecycle, while Vue manages the content within that container.

### Rationale
- **Separation of Concerns**: React handles Grafana panel integration (props, lifecycle, options), Vue handles visualization rendering
- **Clean Lifecycle**: React's `useEffect` cleanup function naturally maps to Vue's `app.unmount()`
- **Proven Pattern**: This approach is used successfully in other React-Vue hybrid applications
- **Type Safety**: Both frameworks maintain their type systems without complex bridging

### Alternatives Considered

**1. vue-react-wrapper Library**
- **Rejected**: Adds external dependency, potential CSP issues, less control over lifecycle
- **Why Not**: Unnecessary abstraction for our simple use case

**2. Web Components Bridge**
- **Rejected**: Requires compiling Vue to Web Components, increases bundle size, browser compatibility concerns
- **Why Not**: Over-engineered for single component integration

**3. iframe Isolation**
- **Rejected**: Security concerns, communication overhead, styling isolation issues
- **Why Not**: Violates principle I (Security First) and adds unnecessary complexity

### Implementation Guide

```typescript
// vueBootstrap.ts
import { createApp, App as VueApp } from 'vue';

export function mountVueApp(
  container: HTMLElement,
  component: any,
  props: Record<string, any>
): VueApp {
  const app = createApp(component, props);
  app.mount(container);
  return app;
}

export function unmountVueApp(app: VueApp): void {
  app.unmount();
}

// React component
const VueContainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<VueApp | null>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      appRef.current = mountVueApp(containerRef.current, PevComponent, props);
    }
    return () => {
      if (appRef.current) {
        unmountVueApp(appRef.current);
      }
    };
  }, []);
  
  return <div ref={containerRef} />;
};
```

**Key Points**:
- Use `useRef` for both container element and Vue app instance
- Mount in `useEffect` with empty dependency array
- Unmount in cleanup function
- Use separate `useEffect` for prop updates (with dependencies)

---

## Decision 0.2: PEV2 Library Integration

### Decision
Use PEV2's modular exports to import only required components and utilities. Bundle the complete PEV2 library including parser and visualization components.

### Rationale
- **Official Support**: PEV2 is designed as a library, not just a standalone app
- **Complete Functionality**: Need both parser (text → JSON) and visualization (JSON → UI)
- **Bundle Control**: Can tree-shake unused parts if needed
- **Maintained**: Active project with PostgreSQL community backing

### Alternatives Considered

**1. Fork PEV2 and Modify**
- **Rejected**: Creates maintenance burden, loses upstream updates
- **Why Not**: PEV2 API is sufficient as-is

**2. Reimplement Visualization**
- **Rejected**: Extremely complex (1000+ lines of D3/SVG logic), high risk
- **Why Not**: Violates "don't reinvent the wheel" principle

**3. Use PEV2 as iframe/embed**
- **Rejected**: CSP violations, communication complexity
- **Why Not**: Violates principle III (Bundled Dependencies)

### Implementation Guide

**PEV2 Package Structure**:
```typescript
// From pev2 npm package
import { Plan } from 'pev2';                // Vue component
import { parsePlan } from 'pev2/parser';    // Text parser
import 'pev2/dist/style.css';               // Styles
```

**Required Exports**:
- `Plan` component (Vue 3 component)
- `parsePlan` function (text → JSON converter)
- CSS styles (bundled separately)

**Props Interface**:
```typescript
interface PlanProps {
  planSource: string;        // JSON string or text
  query?: string;            // Optional SQL query
  planStats?: PlanStats;     // Optional statistics
}
```

**Integration Pattern**:
```typescript
import { createApp } from 'vue';
import { Plan } from 'pev2';
import 'pev2/dist/style.css';

const app = createApp({
  components: { Plan },
  template: '<Plan :planSource="planJson" />',
  data() {
    return { planJson: jsonString };
  }
});
```

**Key Points**:
- Import component, not full app
- CSS must be imported separately (handled by webpack)
- Plan component accepts JSON string, not parsed object
- Component handles its own parsing and rendering

---

## Decision 0.3: Webpack Bundling for Vue + PEV2

### Decision
Extend Grafana's webpack configuration to add Vue loader and configure PEV2 bundling with all assets included inline.

### Rationale
- **CSP Compliance**: All assets bundled = no external loads
- **Grafana Compatibility**: Extends existing config rather than replacing
- **Performance**: Single bundle reduces HTTP requests
- **Maintainability**: Standard webpack patterns, well-documented

### Alternatives Considered

**1. Separate Vue Bundle + Dynamic Import**
- **Rejected**: Dynamic imports may trigger CSP, adds loading complexity
- **Why Not**: Violates principle III (Bundled Dependencies)

**2. Vite Build**
- **Rejected**: Grafana uses webpack, mixing build tools creates complexity
- **Why Not**: Non-standard for Grafana plugins

**3. Vue CLI**
- **Rejected**: Not compatible with Grafana plugin structure
- **Why Not**: Doesn't integrate with @grafana/create-plugin tooling

### Implementation Guide

**Webpack Configuration** (`.config/webpack/webpack.config.ts`):

```typescript
import { Configuration } from 'webpack';
import { getPluginJson } from '@grafana/toolkit';

const config: Configuration = {
  // ... existing Grafana config
  
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.vue'],
    alias: {
      // Use runtime-only build (no template compiler)
      vue: 'vue/dist/vue.runtime.esm-bundler.js',
    },
  },
  
  module: {
    rules: [
      // ... existing rules
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  
  plugins: [
    // ... existing plugins
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    }),
    new VueLoaderPlugin(),
  ],
};
```

**Package Dependencies**:
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "pev2": "^3.12.0"
  },
  "devDependencies": {
    "vue-loader": "^17.4.0",
    "@vue/compiler-sfc": "^3.4.0"
  }
}
```

**CSS Handling**:
- Use `style-loader` to inject CSS into DOM
- PEV2 styles imported: `import 'pev2/dist/style.css'`
- Theme overrides in separate file: `src/styles/pev2-overrides.css`

**Bundle Size Optimization**:
- Vue runtime-only build (~70KB gzipped)
- PEV2 library (~200KB gzipped)
- Total expected: ~1.5MB uncompressed, ~400KB gzipped
- Well within 2MB requirement

**Key Points**:
- Extend, don't replace Grafana webpack config
- Use runtime-only Vue (no template compiler)
- DefinePlugin flags reduce bundle size
- All assets inlined (no external URLs)

---

## Decision 0.4: Grafana DataFrame to EXPLAIN Plan Extraction

### Decision
Access DataFrame series fields by name, retrieve first value as string, with comprehensive error handling for missing fields and empty data.

### Rationale
- **Type Safety**: DataFrame structure is well-typed in @grafana/data
- **Simplicity**: Direct field access, no complex transformations
- **Flexibility**: Works with any data source (PostgreSQL, JSON API, TestData)
- **Robustness**: Handles edge cases (empty, missing fields, wrong types)

### Alternatives Considered

**1. Grafana Transformations API**
- **Rejected**: Adds unnecessary complexity for simple field extraction
- **Why Not**: Over-engineered for single-field access

**2. DataFrame.toCSV() then Parse**
- **Rejected**: Performance overhead, data serialization/parsing
- **Why Not**: Introduces string parsing complexity

**3. Assume First Field**
- **Rejected**: Not configurable, breaks with multi-field queries
- **Why Not**: Violates user story 4 (data source flexibility)

### Implementation Guide

**DataFrame Structure** (from @grafana/data):
```typescript
interface PanelData {
  series: DataFrame[];  // Array of data frames
  state: LoadingState;
  timeRange: TimeRange;
}

interface DataFrame {
  name?: string;
  fields: Field[];
  length: number;
}

interface Field {
  name: string;
  type: FieldType;
  values: Vector<any>;
  config?: FieldConfig;
}
```

**Extraction Logic**:
```typescript
import { PanelData, Field } from '@grafana/data';

function extractPlanData(
  data: PanelData,
  fieldName: string
): string {
  // 1. Validate series exists
  if (!data.series || data.series.length === 0) {
    throw new Error('NO_DATA');
  }
  
  // 2. Get first series (use first row)
  const series = data.series[0];
  
  // 3. Log warning if multiple series
  if (data.series.length > 1) {
    console.warn(
      `Multiple series detected (${data.series.length}). Using first series.`
    );
  }
  
  // 4. Find field by name
  const field = series.fields.find(f => f.name === fieldName);
  
  if (!field) {
    const available = series.fields.map(f => f.name).join(', ');
    throw new Error(
      `FIELD_NOT_FOUND: "${fieldName}". Available: ${available}`
    );
  }
  
  // 5. Get first value
  if (field.values.length === 0) {
    throw new Error('NO_DATA: Field is empty');
  }
  
  const value = field.values.get(0);
  
  // 6. Convert to string
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  throw new Error(
    `INVALID_FORMAT: Field value is ${typeof value}, expected string or object`
  );
}
```

**PostgreSQL Data Source Examples**:

**EXPLAIN (FORMAT JSON)**:
```sql
-- Query
EXPLAIN (FORMAT JSON) SELECT * FROM users;

-- DataFrame structure
{
  series: [{
    fields: [
      {
        name: "QUERY PLAN",
        type: FieldType.string,
        values: ['[{"Plan": {...}}]']  // JSON string
      }
    ]
  }]
}
```

**Plain Text EXPLAIN**:
```sql
-- Query
EXPLAIN SELECT * FROM users;

-- DataFrame structure
{
  series: [{
    fields: [
      {
        name: "QUERY PLAN",
        type: FieldType.string,
        values: ['Seq Scan on users...']  // Text string
      }
    ]
  }]
}
```

**Key Points**:
- Always use first series, first row
- Field name is configurable (default: "plan" or "QUERY PLAN")
- Handle both string and object field types
- Throw typed errors for all failure cases
- Log warnings for non-standard scenarios

---

## Decision 0.5: PostgreSQL EXPLAIN JSON Format

### Decision
Define comprehensive TypeScript interfaces matching PostgreSQL 10-16 EXPLAIN (FORMAT JSON) output structure, with all optional fields marked as such.

### Rationale
- **Type Safety**: Compile-time validation prevents runtime errors
- **Documentation**: Types serve as living documentation
- **IDE Support**: Autocomplete and inline docs
- **Version Compatibility**: Covers PostgreSQL 10-16 variations

### Alternatives Considered

**1. Use `any` Type**
- **Rejected**: Loses type safety, no IDE support
- **Why Not**: Violates principle VII (Type Safety)

**2. Runtime Validation Only**
- **Rejected**: Errors caught at runtime, not compile time
- **Why Not**: TypeScript provides free compile-time checks

**3. Use PEV2 Types**
- **Rejected**: PEV2 may not expose complete type definitions
- **Why Not**: Need control over our own type contracts

### Implementation Guide

**Core Types** (`src/types/plan-types.ts`):

```typescript
/**
 * Root execution plan returned by PostgreSQL EXPLAIN (FORMAT JSON)
 */
export interface ExecutionPlan {
  Plan: PlanNode;
  "Planning Time"?: number;  // ms
  "Execution Time"?: number; // ms
  Triggers?: Trigger[];
  "JIT"?: JITInfo;
}

/**
 * Individual node in the execution plan tree
 */
export interface PlanNode {
  // Node identification
  "Node Type": NodeType;
  "Parent Relationship"?: ParentRelationship;
  
  // Cost estimates
  "Startup Cost": number;
  "Total Cost": number;
  "Plan Rows": number;
  "Plan Width": number;
  
  // Actual execution (if ANALYZE)
  "Actual Startup Time"?: number;
  "Actual Total Time"?: number;
  "Actual Rows"?: number;
  "Actual Loops"?: number;
  
  // Relation info (for scans)
  "Relation Name"?: string;
  "Schema"?: string;
  "Alias"?: string;
  
  // Index info
  "Index Name"?: string;
  "Index Cond"?: string;
  
  // Filters and conditions
  "Filter"?: string;
  "Rows Removed by Filter"?: number;
  "Join Type"?: JoinType;
  "Join Filter"?: string;
  
  // Sorting
  "Sort Key"?: string[];
  "Sort Method"?: string;
  "Sort Space Used"?: number;
  "Sort Space Type"?: "Memory" | "Disk";
  
  // Aggregation
  "Group Key"?: string[];
  "Partial Mode"?: string;
  
  // Output
  "Output"?: string[];
  
  // Child plans
  Plans?: PlanNode[];
  
  // Workers (parallel query)
  "Workers Planned"?: number;
  "Workers Launched"?: number;
  "Worker Number"?: number;
  
  // Additional fields
  "Shared Hit Blocks"?: number;
  "Shared Read Blocks"?: number;
  "Shared Written Blocks"?: number;
  "I/O Read Time"?: number;
  "I/O Write Time"?: number;
}

/**
 * PostgreSQL node types
 */
export type NodeType =
  // Scan nodes
  | "Seq Scan"
  | "Index Scan"
  | "Index Only Scan"
  | "Bitmap Heap Scan"
  | "Bitmap Index Scan"
  | "Tid Scan"
  | "Subquery Scan"
  | "Function Scan"
  | "Values Scan"
  | "CTE Scan"
  | "WorkTable Scan"
  | "Foreign Scan"
  | "Custom Scan"
  | "Sample Scan"
  // Join nodes
  | "Nested Loop"
  | "Merge Join"
  | "Hash Join"
  // Materialization
  | "Materialize"
  // Sorting
  | "Sort"
  | "Incremental Sort"
  // Grouping
  | "Group"
  | "Aggregate"
  | "WindowAgg"
  | "Unique"
  | "Gather"
  | "Gather Merge"
  // Other
  | "Hash"
  | "SetOp"
  | "LockRows"
  | "Limit"
  | "Append"
  | "Merge Append"
  | "Recursive Union"
  | "BitmapAnd"
  | "BitmapOr"
  | "Result"
  | "ProjectSet"
  | "ModifyTable"
  | "Memoize";

export type ParentRelationship = "Outer" | "Inner" | "Subquery" | "Member" | "InitPlan" | "SubPlan";

export type JoinType = "Inner" | "Left" | "Full" | "Right" | "Semi" | "Anti";

/**
 * Trigger execution information
 */
export interface Trigger {
  "Trigger Name": string;
  "Relation": string;
  "Time": number;
  "Calls": number;
}

/**
 * JIT compilation information
 */
export interface JITInfo {
  "Functions"?: number;
  "Options": {
    "Inlining": boolean;
    "Optimization": boolean;
    "Expressions": boolean;
    "Deforming": boolean;
  };
  "Timing"?: {
    "Generation": number;
    "Inlining": number;
    "Optimization": number;
    "Emission": number;
    "Total": number;
  };
}

/**
 * Validation helper
 */
export function isValidPlan(obj: any): obj is ExecutionPlan {
  return (
    obj &&
    typeof obj === 'object' &&
    'Plan' in obj &&
    typeof obj.Plan === 'object' &&
    'Node Type' in obj.Plan &&
    'Startup Cost' in obj.Plan &&
    'Total Cost' in obj.Plan
  );
}
```

**Usage Example**:
```typescript
import { ExecutionPlan, isValidPlan } from './plan-types';

function parsePlan(jsonString: string): ExecutionPlan {
  const parsed = JSON.parse(jsonString);
  
  if (!isValidPlan(parsed)) {
    throw new Error('Invalid execution plan structure');
  }
  
  return parsed;
}
```

**Key Points**:
- All required fields are non-optional
- Optional fields use `?:` syntax
- String literal types for enums
- Runtime validation helper included
- Covers PostgreSQL 10-16 features
- Comments document field meanings

---

## Decision 0.6: Error Handling Patterns in Grafana Plugins

### Decision
Use React Error Boundaries for component errors, typed error states for data errors, and @grafana/ui Alert component for user-facing messages.

### Rationale
- **Separation**: Component errors vs data errors require different handling
- **User Experience**: Alert component provides consistent Grafana UX
- **Debugging**: Console logs with context aid troubleshooting
- **Graceful Degradation**: Errors don't crash entire dashboard

### Alternatives Considered

**1. Try-Catch Only**
- **Rejected**: Doesn't catch React component errors
- **Why Not**: Incomplete error coverage

**2. Global Error Handler**
- **Rejected**: Too coarse-grained, loses error context
- **Why Not**: Can't provide specific resolution hints

**3. Custom Error UI**
- **Rejected**: Inconsistent with Grafana design system
- **Why Not**: @grafana/ui provides standard components

### Implementation Guide

**Error Type Hierarchy**:

```typescript
// error-types.ts
export enum ErrorType {
  NO_DATA = 'NO_DATA',
  FIELD_NOT_FOUND = 'FIELD_NOT_FOUND',
  INVALID_FORMAT = 'INVALID_FORMAT',
  PARSE_ERROR = 'PARSE_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  CSP_VIOLATION = 'CSP_VIOLATION',
}

export interface ErrorState {
  type: ErrorType;
  message: string;
  details?: string;
  resolutionHint: string;
}

export class PlanError extends Error {
  constructor(
    public readonly errorType: ErrorType,
    message: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'PlanError';
  }
}
```

**Error Boundary** (catches React component errors):

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert } from '@grafana/ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PEV Panel Error Boundary:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert title="Visualization Error" severity="error">
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <p>Check browser console for details.</p>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

**Error Display Component**:

```typescript
import React from 'react';
import { Alert } from '@grafana/ui';
import { ErrorState, ErrorType } from '../types/error-types';

interface Props {
  error: ErrorState;
}

const SEVERITY_MAP: Record<ErrorType, 'error' | 'warning' | 'info'> = {
  [ErrorType.NO_DATA]: 'info',
  [ErrorType.FIELD_NOT_FOUND]: 'warning',
  [ErrorType.INVALID_FORMAT]: 'error',
  [ErrorType.PARSE_ERROR]: 'error',
  [ErrorType.RENDER_ERROR]: 'error',
  [ErrorType.CSP_VIOLATION]: 'error',
};

export const ErrorDisplay: React.FC<Props> = ({ error }) => {
  const severity = SEVERITY_MAP[error.type];

  return (
    <Alert title={error.message} severity={severity}>
      <p>{error.resolutionHint}</p>
      {error.details && (
        <details style={{ marginTop: 8, fontSize: 12 }}>
          <summary>Technical Details</summary>
          <pre style={{ marginTop: 4 }}>{error.details}</pre>
        </details>
      )}
    </Alert>
  );
};
```

**Service Error Handling**:

```typescript
import { ErrorType, PlanError } from '../types/error-types';

function extractPlanData(data: PanelData, fieldName: string): string {
  try {
    if (!data.series || data.series.length === 0) {
      throw new PlanError(
        ErrorType.NO_DATA,
        'No data available',
        'DataFrame is empty or undefined'
      );
    }

    const field = data.series[0].fields.find(f => f.name === fieldName);
    
    if (!field) {
      const available = data.series[0].fields.map(f => f.name).join(', ');
      throw new PlanError(
        ErrorType.FIELD_NOT_FOUND,
        `Field "${fieldName}" not found`,
        `Available fields: ${available}`
      );
    }

    return String(field.values.get(0));
  } catch (error) {
    if (error instanceof PlanError) {
      throw error;
    }
    
    // Wrap unexpected errors
    throw new PlanError(
      ErrorType.RENDER_ERROR,
      'Unexpected error during data extraction',
      error instanceof Error ? error.message : String(error)
    );
  }
}
```

**Panel Component Integration**:

```typescript
export const ExplainPanel: React.FC<PanelProps<PanelOptions>> = (props) => {
  const [error, setError] = useState<ErrorState | null>(null);

  useEffect(() => {
    try {
      const planData = extractPlanData(props.data, props.options.planFieldName);
      // ... process data
      setError(null);
    } catch (err) {
      if (err instanceof PlanError) {
        setError({
          type: err.errorType,
          message: err.message,
          details: err.details,
          resolutionHint: getResolutionHint(err.errorType),
        });
      } else {
        console.error('Unexpected error:', err);
        setError({
          type: ErrorType.RENDER_ERROR,
          message: 'Unexpected error',
          details: err instanceof Error ? err.message : String(err),
          resolutionHint: 'Check browser console for details',
        });
      }
    }
  }, [props.data, props.options]);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <ErrorBoundary>
      {/* Main panel content */}
    </ErrorBoundary>
  );
};
```

**Console Logging Standards**:

```typescript
// logger.ts
export const logger = {
  error: (context: string, error: unknown, data?: any) => {
    console.error(`[PEV Panel] ${context}:`, {
      error,
      data,
      timestamp: new Date().toISOString(),
    });
  },
  
  warn: (context: string, message: string, data?: any) => {
    console.warn(`[PEV Panel] ${context}:`, message, data);
  },
  
  info: (context: string, message: string, data?: any) => {
    console.info(`[PEV Panel] ${context}:`, message, data);
  },
};
```

**Key Points**:
- Error Boundary catches React errors
- Typed errors for data processing
- @grafana/ui Alert for consistent UX
- Console logs include context
- Resolution hints guide users
- Technical details in expandable section

---

## Research Summary

All technical unknowns have been resolved:

✅ **Vue 3 + React Integration**: Manual mounting with useRef + useEffect  
✅ **PEV2 Integration**: Bundle library, use modular imports  
✅ **Webpack Bundling**: Extend Grafana config, add Vue loader  
✅ **DataFrame Extraction**: Direct field access by name  
✅ **EXPLAIN JSON Types**: Comprehensive TypeScript interfaces  
✅ **Error Handling**: Error boundaries + typed errors + Alert component

**Next Phase**: Phase 1 - Design & Contracts

This research resolves all "NEEDS CLARIFICATION" items from Technical Context. Implementation can proceed with full specification clarity.
