/**
 * Constants used throughout the PostgreSQL EXPLAIN Visualizer plugin
 */

// === Default Field Names ===

/**
 * Default DataFrame field name for EXPLAIN output
 */
export const DEFAULT_PLAN_FIELD_NAME = "plan";

/**
 * Common field names used by different data sources
 */
export const COMMON_PLAN_FIELD_NAMES = [
  "plan",
  "QUERY PLAN",
  "execution_plan",
  "explain",
  "query_plan",
  "Plan",
] as const;

// === Font Size Configuration ===

/**
 * Minimum font size for visualization (pixels)
 */
export const MIN_FONT_SIZE = 10;

/**
 * Maximum font size for visualization (pixels)
 */
export const MAX_FONT_SIZE = 24;

/**
 * Default font size for visualization (pixels)
 */
export const DEFAULT_FONT_SIZE = 14;

/**
 * Font size adjustment step (pixels)
 */
export const FONT_SIZE_STEP = 1;

// === Performance Thresholds ===

/**
 * Maximum time for format detection (milliseconds)
 */
export const FORMAT_DETECTION_TIMEOUT_MS = 100;

/**
 * Maximum time for text-to-JSON conversion (milliseconds)
 */
export const TEXT_PARSE_TIMEOUT_MS = 1000;

/**
 * Maximum time for visualization rendering (milliseconds)
 */
export const RENDER_TIMEOUT_MS = 2000;

/**
 * Maximum time for panel resize handling (milliseconds)
 */
export const RESIZE_TIMEOUT_MS = 500;

// === Plan Size Limits ===

/**
 * Maximum number of nodes to render without warning
 */
export const MAX_RECOMMENDED_NODES = 1000;

/**
 * Maximum plan size in bytes (10MB)
 */
export const MAX_PLAN_SIZE_BYTES = 10 * 1024 * 1024;

// === Error Messages ===

/**
 * Message when no data is available
 */
export const NO_DATA_MESSAGE =
  "No data available. Configure a query to return EXPLAIN output.";

/**
 * Message when field is not found
 */
export const FIELD_NOT_FOUND_MESSAGE =
  "Plan field not found in data. Check panel options.";

/**
 * Message for invalid format
 */
export const INVALID_FORMAT_MESSAGE =
  "Invalid EXPLAIN format. Use EXPLAIN (FORMAT JSON) for best results.";

// === Vue Component Configuration ===

/**
 * Vue app container element ID prefix
 */
export const VUE_CONTAINER_ID_PREFIX = "pev-container-";

/**
 * PEV2 style import
 */
export const PEV2_STYLE_PATH = "pev2/dist/style.css";
