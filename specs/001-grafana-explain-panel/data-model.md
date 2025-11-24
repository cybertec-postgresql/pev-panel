# Data Model: PostgreSQL EXPLAIN Visualizer

**Date**: 2025-11-24  
**Phase**: 1 - Design & Contracts  
**Status**: Complete

This document defines all data entities used in the Grafana PostgreSQL EXPLAIN Visualizer plugin.

---

## Entity: Execution Plan

**Description**: Root container for a complete PostgreSQL query execution plan, including the plan tree, timing information, and optional metadata.

**Source**: PostgreSQL `EXPLAIN (FORMAT JSON)` command output

**TypeScript Definition**:

```typescript
interface ExecutionPlan {
  Plan: PlanNode; // Required: root node of plan tree
  "Planning Time"?: number; // Optional: query planning time in milliseconds
  "Execution Time"?: number; // Optional: query execution time (requires ANALYZE)
  Triggers?: Trigger[]; // Optional: trigger execution info (if any)
  JIT?: JITInfo; // Optional: JIT compilation info (PostgreSQL 11+)
}
```

**Fields**:

| Field          | Type      | Required | Description                                       |
| -------------- | --------- | -------- | ------------------------------------------------- |
| Plan           | PlanNode  | Yes      | Root node of the execution plan tree              |
| Planning Time  | number    | No       | Time spent planning query (ms)                    |
| Execution Time | number    | No       | Time spent executing query (ms, requires ANALYZE) |
| Triggers       | Trigger[] | No       | Trigger execution statistics                      |
| JIT            | JITInfo   | No       | JIT compilation information (PostgreSQL 11+)      |

**Validation Rules**:

- `Plan` field MUST be present
- `Plan` MUST be a valid PlanNode object
- If present, `Planning Time` and `Execution Time` MUST be non-negative numbers
- Execution Time only available when EXPLAIN includes ANALYZE option

**Relationships**:

- Contains one root PlanNode
- PlanNode may contain child PlanNodes (hierarchical tree)

**Lifecycle States**:

1. **Extracted**: Obtained from DataFrame as string
2. **Parsed**: Converted to ExecutionPlan object
3. **Validated**: Confirmed structure is valid
4. **Visualized**: Passed to PEV2 for rendering

**Example**:

```json
{
  "Plan": {
    "Node Type": "Seq Scan",
    "Relation Name": "users",
    "Startup Cost": 0.0,
    "Total Cost": 35.5,
    "Plan Rows": 1000,
    "Plan Width": 244
  },
  "Planning Time": 0.123,
  "Execution Time": 2.456
}
```

---

## Entity: Plan Node

**Description**: Individual operation in the execution plan tree. Represents a single step such as a table scan, index scan, join, sort, or aggregation. Forms hierarchical tree structure via `Plans` array.

**Source**: Nested within ExecutionPlan.Plan and recursively in child nodes

**TypeScript Definition**:

```typescript
interface PlanNode {
  // Identity
  "Node Type": NodeType; // Required: type of operation
  "Parent Relationship"?: ParentRelationship;

  // Cost estimates
  "Startup Cost": number; // Required: cost to start node
  "Total Cost": number; // Required: total cost including children
  "Plan Rows": number; // Required: estimated rows
  "Plan Width": number; // Required: average row width in bytes

  // Actual execution (ANALYZE only)
  "Actual Startup Time"?: number;
  "Actual Total Time"?: number;
  "Actual Rows"?: number;
  "Actual Loops"?: number;

  // Relation info (scans)
  "Relation Name"?: string;
  Schema?: string;
  Alias?: string;

  // Index info
  "Index Name"?: string;
  "Index Cond"?: string;

  // Filters
  Filter?: string;
  "Rows Removed by Filter"?: number;

  // Joins
  "Join Type"?: JoinType;
  "Join Filter"?: string;
  "Rows Removed by Join Filter"?: number;

  // Sorting
  "Sort Key"?: string[];
  "Sort Method"?: string;
  "Sort Space Used"?: number;
  "Sort Space Type"?: "Memory" | "Disk";

  // Aggregation
  "Group Key"?: string[];
  "Partial Mode"?: string;

  // Output columns
  Output?: string[];

  // Child plans
  Plans?: PlanNode[]; // Recursive: child operations

  // Parallel query
  "Workers Planned"?: number;
  "Workers Launched"?: number;

  // I/O statistics
  "Shared Hit Blocks"?: number;
  "Shared Read Blocks"?: number;
  "Shared Written Blocks"?: number;
  "I/O Read Time"?: number;
  "I/O Write Time"?: number;
}
```

**Fields** (Required Only):

| Field        | Type     | Description                                 |
| ------------ | -------- | ------------------------------------------- |
| Node Type    | NodeType | Operation type (Seq Scan, Index Scan, etc.) |
| Startup Cost | number   | Cost to retrieve first row                  |
| Total Cost   | number   | Cost to retrieve all rows                   |
| Plan Rows    | number   | Estimated number of rows                    |
| Plan Width   | number   | Average row size in bytes                   |

**Fields** (Optional - Most Common):

| Field               | Type       | Description                      |
| ------------------- | ---------- | -------------------------------- |
| Actual Startup Time | number     | Real startup time (ANALYZE only) |
| Actual Total Time   | number     | Real total time (ANALYZE only)   |
| Actual Rows         | number     | Real row count (ANALYZE only)    |
| Relation Name       | string     | Table name (scan nodes)          |
| Index Name          | string     | Index name (index scan nodes)    |
| Filter              | string     | Filter condition applied         |
| Join Type           | JoinType   | Type of join (join nodes)        |
| Plans               | PlanNode[] | Array of child operations        |

**Node Types** (NodeType enum):

**Scan Operations**:

- Seq Scan - Sequential table scan
- Index Scan - Index-based retrieval
- Index Only Scan - Index contains all needed columns
- Bitmap Heap Scan - Bitmap index scan
- Bitmap Index Scan - Creates bitmap for heap scan
- CTE Scan - Common Table Expression scan

**Join Operations**:

- Nested Loop - Nested loop join
- Merge Join - Merge join (sorted inputs)
- Hash Join - Hash-based join

**Aggregation/Grouping**:

- Aggregate - Aggregation operation
- Group - Grouping operation
- WindowAgg - Window function

**Sorting**:

- Sort - Sort operation
- Incremental Sort - Incremental sort (PostgreSQL 13+)

**Other**:

- Hash - Hash table creation
- Materialize - Materialization node
- Limit - Limit/offset operation
- Append - Union operations
- Result - Result node (constants)

**Validation Rules**:

- `Node Type`, `Startup Cost`, `Total Cost`, `Plan Rows`, and `Plan Width` MUST be present
- `Total Cost` MUST be >= `Startup Cost`
- `Plan Rows` MUST be non-negative
- If `Plans` array present, MUST contain at least one child node
- Actual timing fields only valid when EXPLAIN includes ANALYZE

**Relationships**:

- Parent-child via `Plans` array (tree structure)
- Each child node represents a sub-operation
- Execution flows from leaf nodes upward to root

**State Transitions** (in UI):

1. **Collapsed**: Node visible, children hidden (default for depth > 2)
2. **Expanded**: Node and children visible
3. **Highlighted**: Node selected/hovered
4. **Filtered**: Node matches search criteria

**Example** (Sequential Scan):

```json
{
  "Node Type": "Seq Scan",
  "Parent Relationship": "Outer",
  "Relation Name": "users",
  "Schema": "public",
  "Alias": "u",
  "Startup Cost": 0.0,
  "Total Cost": 35.5,
  "Plan Rows": 1000,
  "Plan Width": 244,
  "Actual Startup Time": 0.012,
  "Actual Total Time": 2.134,
  "Actual Rows": 987,
  "Actual Loops": 1,
  "Filter": "(age > 18)",
  "Rows Removed by Filter": 13,
  "Output": ["id", "name", "email", "age"]
}
```

**Example** (Hash Join with children):

```json
{
  "Node Type": "Hash Join",
  "Join Type": "Inner",
  "Startup Cost": 45.0,
  "Total Cost": 125.5,
  "Plan Rows": 500,
  "Plan Width": 360,
  "Join Filter": "(u.id = o.user_id)",
  "Plans": [
    {
      "Node Type": "Seq Scan",
      "Relation Name": "users",
      "Startup Cost": 0.0,
      "Total Cost": 35.5,
      "Plan Rows": 1000,
      "Plan Width": 244
    },
    {
      "Node Type": "Hash",
      "Startup Cost": 10.0,
      "Total Cost": 10.0,
      "Plan Rows": 250,
      "Plan Width": 116,
      "Plans": [
        {
          "Node Type": "Seq Scan",
          "Relation Name": "orders",
          "Startup Cost": 0.0,
          "Total Cost": 8.0,
          "Plan Rows": 250,
          "Plan Width": 116
        }
      ]
    }
  ]
}
```

---

## Entity: Panel Options

**Description**: User-configurable settings that control panel behavior and visualization appearance. Persisted in dashboard JSON.

**Source**: Grafana panel options UI, stored in dashboard configuration

**TypeScript Definition**:

```typescript
interface PanelOptions {
  planFieldName: string; // DataFrame field containing plan data
  forceJsonMode: boolean; // Skip auto-detection, treat as JSON
  fontSize: number; // Visualization font size (10-24px)
  darkMode: boolean; // Dark theme override
}

const DEFAULT_OPTIONS: PanelOptions = {
  planFieldName: "plan",
  forceJsonMode: false,
  fontSize: 14,
  darkMode: false,
};
```

**Fields**:

| Field         | Type    | Default | Constraints | Description                               |
| ------------- | ------- | ------- | ----------- | ----------------------------------------- |
| planFieldName | string  | "plan"  | Non-empty   | Name of DataFrame field with EXPLAIN data |
| forceJsonMode | boolean | false   | -           | Skip format detection, assume JSON        |
| fontSize      | number  | 14      | 10-24       | Text size in visualization (pixels)       |
| darkMode      | boolean | false   | -           | Override theme detection for dark colors  |

**Validation Rules**:

- `planFieldName` MUST be non-empty string
- `fontSize` MUST be integer between 10 and 24 (inclusive)
- All fields MUST be serializable to JSON (for dashboard storage)
- Changes MUST apply immediately without data re-fetch

**Usage Scenarios**:

**Scenario 1**: PostgreSQL data source uses "QUERY PLAN" field

```typescript
{
  planFieldName: "QUERY PLAN",
  forceJsonMode: false,
  fontSize: 14,
  darkMode: false
}
```

**Scenario 2**: JSON API returns plan in "execution_plan" field

```typescript
{
  planFieldName: "execution_plan",
  forceJsonMode: true,  // Known to be JSON
  fontSize: 16,         // Larger text for presentations
  darkMode: true        // Force dark theme
}
```

**Scenario 3**: Text EXPLAIN with detection issues

```typescript
{
  planFieldName: "plan",
  forceJsonMode: false,
  fontSize: 12,
  darkMode: false
}
```

**State Transitions**:

1. **Default**: Uses DEFAULT_OPTIONS values
2. **Modified**: User changes setting in panel editor
3. **Applied**: Setting takes effect immediately
4. **Persisted**: Saved when dashboard is saved

---

## Entity: Error State

**Description**: Classification of error conditions with user-friendly messages and resolution guidance. Used for graceful error handling throughout the application.

**Source**: Application error handling logic

**TypeScript Definition**:

```typescript
type ErrorType =
  | "NO_DATA"
  | "FIELD_NOT_FOUND"
  | "INVALID_FORMAT"
  | "PARSE_ERROR"
  | "RENDER_ERROR"
  | "CSP_VIOLATION";

interface ErrorState {
  type: ErrorType; // Error classification
  message: string; // User-friendly message
  details?: string; // Technical details (optional)
  resolutionHint: string; // How to fix the issue
}
```

**Error Types**:

| Type            | Severity | User Message                 | Resolution Hint                                |
| --------------- | -------- | ---------------------------- | ---------------------------------------------- |
| NO_DATA         | Info     | No data available            | Configure a query to return EXPLAIN output     |
| FIELD_NOT_FOUND | Warning  | Field '[name]' not found     | Check planFieldName setting in panel options   |
| INVALID_FORMAT  | Error    | Invalid EXPLAIN format       | Ensure query returns EXPLAIN JSON or text      |
| PARSE_ERROR     | Error    | Unable to parse EXPLAIN text | Try EXPLAIN (FORMAT JSON) or check plan format |
| RENDER_ERROR    | Error    | Visualization error          | Check browser console for details              |
| CSP_VIOLATION   | Error    | Plugin assets blocked        | Contact Grafana administrator                  |

**Validation Rules**:

- `type` MUST be one of the defined ErrorType values
- `message` MUST be non-empty and user-friendly (no technical jargon)
- `resolutionHint` MUST provide actionable guidance
- `details` (if present) MAY contain technical information for debugging

**State Transitions**:

1. **Normal Operation**: No error state
2. **Error Detected**: Error state created with type and message
3. **Error Displayed**: UI shows error with resolution hint
4. **Error Resolved**: User action or data update clears error
5. **Return to Normal**: Error state cleared, visualization proceeds

**Usage Examples**:

**Example 1: No Data**

```typescript
{
  type: 'NO_DATA',
  message: 'No data available',
  resolutionHint: 'Configure a query to return EXPLAIN output',
}
```

**Example 2: Field Not Found**

```typescript
{
  type: 'FIELD_NOT_FOUND',
  message: 'Field "query_plan" not found',
  details: 'Available fields: id, name, timestamp, plan',
  resolutionHint: 'Update planFieldName to "plan" in panel options',
}
```

**Example 3: Parse Error**

```typescript
{
  type: 'PARSE_ERROR',
  message: 'Unable to parse EXPLAIN text format',
  details: 'ParseError: Unexpected token at line 5',
  resolutionHint: 'Try EXPLAIN (FORMAT JSON) instead of plain EXPLAIN',
}
```

**Example 4: Render Error**

```typescript
{
  type: 'RENDER_ERROR',
  message: 'Visualization error: Cannot read property of undefined',
  details: 'TypeError: Cannot read property "Node Type" of undefined\n  at PlanNode.render:42',
  resolutionHint: 'Check browser console for stack trace. This may indicate invalid plan structure.',
}
```

---

## Supporting Types

### Trigger

**Description**: Execution statistics for database triggers (if query involves triggers).

```typescript
interface Trigger {
  "Trigger Name": string; // Name of trigger
  Relation: string; // Table name
  Time: number; // Execution time (ms)
  Calls: number; // Number of executions
}
```

### JIT Information

**Description**: Just-In-Time compilation information (PostgreSQL 11+).

```typescript
interface JITInfo {
  Functions?: number;
  Options: {
    Inlining: boolean;
    Optimization: boolean;
    Expressions: boolean;
    Deforming: boolean;
  };
  Timing?: {
    Generation: number;
    Inlining: number;
    Optimization: number;
    Emission: number;
    Total: number;
  };
}
```

### Parent Relationship

**Description**: Relationship of a node to its parent in the plan tree.

```typescript
type ParentRelationship =
  | "Outer" // Outer side of join
  | "Inner" // Inner side of join
  | "Subquery" // Subquery execution
  | "Member" // Member of append
  | "InitPlan" // Initialization plan
  | "SubPlan"; // Sub-plan execution
```

### Join Type

**Description**: Type of join operation.

```typescript
type JoinType =
  | "Inner" // Inner join
  | "Left" // Left outer join
  | "Right" // Right outer join
  | "Full" // Full outer join
  | "Semi" // Semi join
  | "Anti"; // Anti join
```

---

## Data Flow

```
1. Grafana Data Source
   ↓ (returns DataFrame)
2. ExplainPanel Component
   ↓ (extracts field)
3. Plan String (JSON or text)
   ↓ (format detection)
4. Format Type (json | text)
   ↓ (parsing if needed)
5. ExecutionPlan Object
   ↓ (validation)
6. Valid ExecutionPlan
   ↓ (pass to Vue)
7. PEV2 Visualization
   ↓ (user interaction)
8. UI State (expanded/collapsed nodes)
```

**Error Flow**:

```
Any step above
   ↓ (error occurs)
ErrorState Created
   ↓ (display)
ErrorDisplay Component
   ↓ (show to user)
User takes action
   ↓ (resolve)
Return to Normal Flow
```

---

## Summary

This data model defines 5 core entities:

1. **ExecutionPlan** - Root container for query plan
2. **PlanNode** - Individual operation in plan tree (recursive)
3. **PanelOptions** - User configuration settings
4. **ErrorState** - Error classification and guidance
5. **Supporting Types** - Trigger, JITInfo, enums

All entities are fully typed with TypeScript interfaces, validation rules, and usage examples. The model supports PostgreSQL 10-16 EXPLAIN output formats and provides complete type safety for the implementation.

**Next Phase**: Generate contract files (TypeScript interfaces) in `/contracts/` directory.
