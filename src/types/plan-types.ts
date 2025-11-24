/**
 * PostgreSQL EXPLAIN JSON Type Definitions
 *
 * Complete TypeScript interfaces for PostgreSQL EXPLAIN (FORMAT JSON) output.
 * Covers PostgreSQL versions 10-16.
 *
 * @see https://www.postgresql.org/docs/current/using-explain.html
 */

/**
 * Root execution plan returned by PostgreSQL EXPLAIN (FORMAT JSON)
 */
export interface ExecutionPlan {
  /** Root node of the execution plan tree */
  Plan: PlanNode;

  /** Time spent planning the query (milliseconds) */
  "Planning Time"?: number;

  /** Time spent executing the query (milliseconds, requires ANALYZE) */
  "Execution Time"?: number;

  /** Trigger execution statistics (if any triggers were fired) */
  Triggers?: Trigger[];

  /** JIT compilation information (PostgreSQL 11+) */
  JIT?: JITInfo;
}

/**
 * Individual node in the execution plan tree
 *
 * Represents a single operation (scan, join, sort, etc.) with cost estimates,
 * actual execution statistics (if ANALYZE), and optional child nodes.
 */
export interface PlanNode {
  // === Node Identification ===

  /** Type of operation (Seq Scan, Index Scan, Hash Join, etc.) */
  "Node Type": NodeType;

  /** Relationship to parent node in plan tree */
  "Parent Relationship"?: ParentRelationship;

  // === Cost Estimates (always present) ===

  /** Estimated startup cost (arbitrary units) */
  "Startup Cost": number;

  /** Estimated total cost including all child nodes (arbitrary units) */
  "Total Cost": number;

  /** Estimated number of rows this node will return */
  "Plan Rows": number;

  /** Estimated average width of rows in bytes */
  "Plan Width": number;

  // === Actual Execution Statistics (ANALYZE only) ===

  /** Actual time to start returning rows (milliseconds) */
  "Actual Startup Time"?: number;

  /** Actual total time including all rows (milliseconds) */
  "Actual Total Time"?: number;

  /** Actual number of rows returned */
  "Actual Rows"?: number;

  /** Number of times this node was executed */
  "Actual Loops"?: number;

  // === Relation Information (scan nodes) ===

  /** Table name being scanned */
  "Relation Name"?: string;

  /** Schema name containing the table */
  Schema?: string;

  /** Table alias used in query */
  Alias?: string;

  // === Index Information (index scan nodes) ===

  /** Name of index being used */
  "Index Name"?: string;

  /** Index scan condition */
  "Index Cond"?: string;

  // === Filter Information ===

  /** Filter condition applied to rows */
  Filter?: string;

  /** Number of rows removed by filter */
  "Rows Removed by Filter"?: number;

  // === Join Information (join nodes) ===

  /** Type of join operation */
  "Join Type"?: JoinType;

  /** Join condition/filter */
  "Join Filter"?: string;

  /** Number of rows removed by join filter */
  "Rows Removed by Join Filter"?: number;

  // === Sort Information (sort nodes) ===

  /** Columns used for sorting */
  "Sort Key"?: string[];

  /** Sort algorithm used (quicksort, top-N heapsort, etc.) */
  "Sort Method"?: string;

  /** Amount of memory/disk used for sorting (KB) */
  "Sort Space Used"?: number;

  /** Where sort was performed (Memory or Disk) */
  "Sort Space Type"?: "Memory" | "Disk";

  // === Aggregation Information (aggregate/group nodes) ===

  /** Columns used for grouping */
  "Group Key"?: string[];

  /** Partial aggregation mode (for parallel queries) */
  "Partial Mode"?: string;

  // === Output Information ===

  /** Output column list */
  Output?: string[];

  // === Child Nodes (recursive) ===

  /** Array of child plan nodes (forms tree structure) */
  Plans?: PlanNode[];

  // === Parallel Query Information ===

  /** Number of parallel workers planned */
  "Workers Planned"?: number;

  /** Number of parallel workers actually launched */
  "Workers Launched"?: number;

  /** Worker number (for individual worker plans) */
  "Worker Number"?: number;

  // === I/O Statistics (requires BUFFERS) ===

  /** Shared blocks found in cache */
  "Shared Hit Blocks"?: number;

  /** Shared blocks read from disk */
  "Shared Read Blocks"?: number;

  /** Shared blocks written to disk */
  "Shared Written Blocks"?: number;

  /** Time spent reading (milliseconds, requires TIMING) */
  "I/O Read Time"?: number;

  /** Time spent writing (milliseconds, requires TIMING) */
  "I/O Write Time"?: number;

  // === Additional Fields (context-dependent) ===

  /** CTE name (for CTE Scan nodes) */
  "CTE Name"?: string;

  /** Subplan name (for SubPlan nodes) */
  "Subplan Name"?: string;

  /** Function name (for Function Scan nodes) */
  "Function Name"?: string;

  /** Hash buckets (for Hash nodes) */
  "Hash Buckets"?: number;

  /** Original hash buckets (for Hash nodes) */
  "Original Hash Buckets"?: number;

  /** Peak memory usage (KB) */
  "Peak Memory Usage"?: number;
}

/**
 * PostgreSQL node types
 *
 * Comprehensive list of operation types that can appear in execution plans.
 */
export type NodeType =
  // === Scan Nodes ===
  | "Seq Scan" // Sequential table scan
  | "Index Scan" // Index-based retrieval
  | "Index Only Scan" // Index contains all needed columns
  | "Bitmap Heap Scan" // Heap scan using bitmap
  | "Bitmap Index Scan" // Create bitmap from index
  | "Tid Scan" // Tuple ID scan
  | "Subquery Scan" // Subquery in FROM clause
  | "Function Scan" // Function returning rows
  | "Values Scan" // VALUES clause
  | "CTE Scan" // Common Table Expression scan
  | "WorkTable Scan" // Recursive CTE work table
  | "Foreign Scan" // Foreign data wrapper scan
  | "Custom Scan" // Custom scan provider
  | "Sample Scan" // TABLESAMPLE scan

  // === Join Nodes ===
  | "Nested Loop" // Nested loop join
  | "Merge Join" // Merge join (requires sorted inputs)
  | "Hash Join" // Hash-based join

  // === Materialization Nodes ===
  | "Materialize" // Materialize subplan results

  // === Sort Nodes ===
  | "Sort" // Sort operation
  | "Incremental Sort" // Incremental sort (PostgreSQL 13+)

  // === Grouping/Aggregation Nodes ===
  | "Group" // Grouping operation
  | "Aggregate" // Aggregation (COUNT, SUM, etc.)
  | "WindowAgg" // Window function aggregation
  | "Unique" // Remove duplicates
  | "Gather" // Gather results from parallel workers
  | "Gather Merge" // Gather and merge sorted results

  // === Other Nodes ===
  | "Hash" // Build hash table for hash join
  | "SetOp" // Set operation (UNION, INTERSECT, EXCEPT)
  | "LockRows" // Row locking (FOR UPDATE, FOR SHARE)
  | "Limit" // LIMIT/OFFSET operation
  | "Append" // Append multiple subplans (UNION ALL)
  | "Merge Append" // Merge multiple sorted subplans
  | "Recursive Union" // Recursive CTE union
  | "BitmapAnd" // AND multiple bitmaps
  | "BitmapOr" // OR multiple bitmaps
  | "Result" // Constant result or expression evaluation
  | "ProjectSet" // Project set-returning functions
  | "ModifyTable" // INSERT, UPDATE, DELETE
  | "Memoize"; // Memoize subplan results (PostgreSQL 14+)

/**
 * Relationship of a node to its parent in the plan tree
 */
export type ParentRelationship =
  | "Outer" // Outer side of a join
  | "Inner" // Inner side of a join
  | "Subquery" // Subquery execution
  | "Member" // Member of an Append/MergeAppend
  | "InitPlan" // Initialization sub-plan (executed once)
  | "SubPlan"; // Sub-plan (may execute multiple times)

/**
 * Type of join operation
 */
export type JoinType =
  | "Inner" // Inner join (intersection)
  | "Left" // Left outer join
  | "Right" // Right outer join
  | "Full" // Full outer join
  | "Semi" // Semi join (exists)
  | "Anti"; // Anti join (not exists)

/**
 * Trigger execution statistics
 *
 * Information about database triggers that were fired during query execution.
 */
export interface Trigger {
  /** Name of the trigger */
  "Trigger Name": string;

  /** Table the trigger is attached to */
  Relation: string;

  /** Total time spent executing trigger (milliseconds) */
  Time: number;

  /** Number of times trigger was called */
  Calls: number;
}

/**
 * JIT (Just-In-Time) compilation information
 *
 * Available in PostgreSQL 11+ when JIT compilation is enabled.
 */
export interface JITInfo {
  /** Number of functions JIT compiled */
  Functions?: number;

  /** JIT compilation options */
  Options: {
    /** Whether inlining was performed */
    Inlining: boolean;

    /** Whether optimization was performed */
    Optimization: boolean;

    /** Whether expressions were compiled */
    Expressions: boolean;

    /** Whether tuple deforming was compiled */
    Deforming: boolean;
  };

  /** JIT compilation timing breakdown (milliseconds) */
  Timing?: {
    /** Code generation time */
    Generation: number;

    /** Inlining time */
    Inlining: number;

    /** Optimization time */
    Optimization: number;

    /** Code emission time */
    Emission: number;

    /** Total JIT time */
    Total: number;
  };
}

/**
 * Type guard to validate ExecutionPlan structure
 *
 * @param obj - Object to validate
 * @returns True if obj is a valid ExecutionPlan
 */
export function isValidExecutionPlan(obj: any): obj is ExecutionPlan {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "Plan" in obj &&
    isValidPlanNode(obj.Plan)
  );
}

/**
 * Type guard to validate PlanNode structure
 *
 * @param obj - Object to validate
 * @returns True if obj is a valid PlanNode
 */
export function isValidPlanNode(obj: any): obj is PlanNode {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "Node Type" in obj &&
    typeof obj["Node Type"] === "string" &&
    "Startup Cost" in obj &&
    typeof obj["Startup Cost"] === "number" &&
    "Total Cost" in obj &&
    typeof obj["Total Cost"] === "number" &&
    "Plan Rows" in obj &&
    typeof obj["Plan Rows"] === "number" &&
    "Plan Width" in obj &&
    typeof obj["Plan Width"] === "number"
  );
}
