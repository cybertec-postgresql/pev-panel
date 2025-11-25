/**
 * Panel Options Type Definitions
 *
 * User-configurable settings for the PostgreSQL EXPLAIN Visualizer panel.
 * These options are stored in the dashboard JSON and control visualization behavior.
 */

/**
 * Panel configuration options
 *
 * These settings control how the panel extracts and displays PostgreSQL EXPLAIN data.
 */
export interface PanelOptions {
  /**
   * Name of the DataFrame field containing EXPLAIN output
   *
   * Different data sources may use different field names:
   * - PostgreSQL data source: typically "QUERY PLAN"
   * - JSON API: configurable, e.g., "plan", "execution_plan"
   * - TestData: custom field name
   *
   * @default "plan"
   */
  planFieldName: string;

  /**
   * Force JSON mode - skip format auto-detection
   *
   * When true, the plugin assumes input is JSON and skips format detection.
   * Use this when:
   * - Auto-detection fails or is ambiguous
   * - Performance optimization (skips detection step)
   * - You know the data source always returns JSON
   *
   * @default false
   */
  forceJsonMode: boolean;

  /**
   * Font size for visualization text (pixels)
   *
   * Controls the size of all text in the visualization including:
   * - Node labels
   * - Cost/row information
   * - Tooltips
   * - Timing details
   *
   * Smaller values fit more on screen, larger values improve readability.
   *
   * @default 14
   * @minimum 10
   * @maximum 24
   */
  fontSize: number;
}

/**
 * Default values for panel options
 *
 * Used when panel is first created or when options are reset.
 */
export const DEFAULT_PANEL_OPTIONS: PanelOptions = {
  planFieldName: "plan",
  forceJsonMode: false,
  fontSize: 14,
};

/**
 * Validation constraints for panel options
 */
export const PANEL_OPTIONS_CONSTRAINTS = {
  /** Minimum font size (pixels) */
  MIN_FONT_SIZE: 10,

  /** Maximum font size (pixels) */
  MAX_FONT_SIZE: 24,

  /** Default font size (pixels) */
  DEFAULT_FONT_SIZE: 14,

  /** Font size step for slider (pixels) */
  FONT_SIZE_STEP: 1,
} as const;

/**
 * Validate panel options
 *
 * Ensures all option values are within acceptable ranges and types.
 *
 * @param options - Options to validate
 * @returns Validated options with corrections applied
 * @throws Error if options are invalid and cannot be corrected
 */
export function validatePanelOptions(
  options: Partial<PanelOptions>,
): PanelOptions {
  const validated: PanelOptions = {
    ...DEFAULT_PANEL_OPTIONS,
    ...options,
  };

  // Validate planFieldName
  if (
    typeof validated.planFieldName !== "string" ||
    validated.planFieldName.trim() === ""
  ) {
    throw new Error("planFieldName must be a non-empty string");
  }

  // Validate forceJsonMode
  if (typeof validated.forceJsonMode !== "boolean") {
    validated.forceJsonMode = DEFAULT_PANEL_OPTIONS.forceJsonMode;
  }

  // Validate fontSize
  if (typeof validated.fontSize !== "number" || isNaN(validated.fontSize)) {
    validated.fontSize = PANEL_OPTIONS_CONSTRAINTS.DEFAULT_FONT_SIZE;
  } else {
    validated.fontSize = Math.max(
      PANEL_OPTIONS_CONSTRAINTS.MIN_FONT_SIZE,
      Math.min(
        PANEL_OPTIONS_CONSTRAINTS.MAX_FONT_SIZE,
        Math.round(validated.fontSize),
      ),
    );
  }

  return validated;
}

/**
 * Common field names used by different data sources
 *
 * Helper list for user reference and autocomplete suggestions.
 */
export const COMMON_FIELD_NAMES = [
  "plan", // Generic
  "QUERY PLAN", // PostgreSQL data source
  "execution_plan", // Common API naming
  "explain", // Alternative naming
  "query_plan", // Alternative naming
  "Plan", // Alternative casing
] as const;

/**
 * Type for common field names
 */
export type CommonFieldName = (typeof COMMON_FIELD_NAMES)[number];
