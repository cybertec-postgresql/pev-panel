/**
 * Error Type Definitions
 *
 * Classification and structure for error states in the PostgreSQL EXPLAIN Visualizer.
 * Provides user-friendly error messages with actionable resolution hints.
 */

/**
 * Error type classification
 *
 * Each error type represents a specific failure mode with appropriate
 * user messaging and resolution guidance.
 */
export enum ErrorType {
  /**
   * No data available from data source
   * Severity: Info
   */
  NO_DATA = "NO_DATA",

  /**
   * Specified field not found in DataFrame
   * Severity: Warning
   */
  FIELD_NOT_FOUND = "FIELD_NOT_FOUND",

  /**
   * Data is neither valid JSON nor parseable text
   * Severity: Error
   */
  INVALID_FORMAT = "INVALID_FORMAT",

  /**
   * Text-to-JSON parsing failed
   * Severity: Error
   */
  PARSE_ERROR = "PARSE_ERROR",

  /**
   * Visualization rendering failed
   * Severity: Error
   */
  RENDER_ERROR = "RENDER_ERROR",

  /**
   * Browser blocked resource due to CSP
   * Severity: Error
   */
  CSP_VIOLATION = "CSP_VIOLATION",
}

/**
 * Error state structure
 *
 * Contains all information needed to display and resolve an error.
 */
export interface ErrorState {
  /** Error classification */
  type: ErrorType;

  /** User-friendly error message (non-technical) */
  message: string;

  /** Optional technical details for debugging */
  details?: string;

  /** Actionable guidance for resolving the error */
  resolutionHint: string;

  /** Optional timestamp when error occurred */
  timestamp?: Date;
}

/**
 * Severity level for each error type
 *
 * Determines how the error is displayed in the UI.
 */
export const ERROR_SEVERITY: Record<ErrorType, "error" | "warning" | "info"> = {
  [ErrorType.NO_DATA]: "info",
  [ErrorType.FIELD_NOT_FOUND]: "warning",
  [ErrorType.INVALID_FORMAT]: "error",
  [ErrorType.PARSE_ERROR]: "error",
  [ErrorType.RENDER_ERROR]: "error",
  [ErrorType.CSP_VIOLATION]: "error",
};

/**
 * Default error messages and resolution hints
 *
 * These can be overridden with more specific information based on context.
 */
export const ERROR_TEMPLATES: Record<
  ErrorType,
  Omit<ErrorState, "timestamp">
> = {
  [ErrorType.NO_DATA]: {
    type: ErrorType.NO_DATA,
    message: "No data available",
    resolutionHint:
      "Configure a query to return EXPLAIN output. Use EXPLAIN (FORMAT JSON) SELECT ... or EXPLAIN SELECT ...",
  },

  [ErrorType.FIELD_NOT_FOUND]: {
    type: ErrorType.FIELD_NOT_FOUND,
    message: "Plan field not found in data",
    resolutionHint:
      'Check the "Plan Field Name" setting in panel options. Verify your query returns a field with EXPLAIN output.',
  },

  [ErrorType.INVALID_FORMAT]: {
    type: ErrorType.INVALID_FORMAT,
    message: "Invalid EXPLAIN format",
    resolutionHint:
      "Ensure your query returns PostgreSQL EXPLAIN output in JSON or text format. Use EXPLAIN (FORMAT JSON) for best results.",
  },

  [ErrorType.PARSE_ERROR]: {
    type: ErrorType.PARSE_ERROR,
    message: "Unable to parse EXPLAIN text format",
    resolutionHint:
      "Try using EXPLAIN (FORMAT JSON) instead of plain text EXPLAIN. If using text format, verify the output is complete and valid.",
  },

  [ErrorType.RENDER_ERROR]: {
    type: ErrorType.RENDER_ERROR,
    message: "Visualization error",
    resolutionHint:
      "Check the browser console for details. This may indicate an invalid plan structure or a bug in the plugin.",
  },

  [ErrorType.CSP_VIOLATION]: {
    type: ErrorType.CSP_VIOLATION,
    message: "Plugin assets blocked by security policy",
    resolutionHint:
      "Contact your Grafana administrator. The plugin requires specific Content Security Policy settings to function.",
  },
};

/**
 * Create an error state from an error type and optional context
 *
 * @param type - Error type
 * @param context - Optional additional context
 * @returns Complete error state
 */
export function createErrorState(
  type: ErrorType,
  context?: {
    message?: string;
    details?: string;
    resolutionHint?: string;
  },
): ErrorState {
  const template = ERROR_TEMPLATES[type];

  return {
    type,
    message: context?.message || template.message,
    details: context?.details,
    resolutionHint: context?.resolutionHint || template.resolutionHint,
    timestamp: new Date(),
  };
}

/**
 * Custom error class for plan-related errors
 *
 * Extends Error with additional context for better error handling.
 */
export class PlanError extends Error {
  public readonly errorType: ErrorType;
  public readonly details?: string;
  public readonly resolutionHint: string;
  public readonly timestamp: Date;

  constructor(
    errorType: ErrorType,
    message?: string,
    details?: string,
    resolutionHint?: string,
  ) {
    const template = ERROR_TEMPLATES[errorType];
    super(message || template.message);

    this.name = "PlanError";
    this.errorType = errorType;
    this.details = details;
    this.resolutionHint = resolutionHint || template.resolutionHint;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PlanError);
    }
  }

  /**
   * Convert PlanError to ErrorState for display
   */
  toErrorState(): ErrorState {
    return {
      type: this.errorType,
      message: this.message,
      details: this.details,
      resolutionHint: this.resolutionHint,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Type guard to check if error is a PlanError
 *
 * @param error - Error to check
 * @returns True if error is a PlanError
 */
export function isPlanError(error: any): error is PlanError {
  return error instanceof PlanError;
}

/**
 * Convert any error to ErrorState
 *
 * Handles PlanError, standard Error, and unknown errors.
 *
 * @param error - Error to convert
 * @returns ErrorState for display
 */
export function toErrorState(error: unknown): ErrorState {
  if (isPlanError(error)) {
    return error.toErrorState();
  }

  if (error instanceof Error) {
    return createErrorState(ErrorType.RENDER_ERROR, {
      message: "Unexpected error",
      details: `${error.name}: ${error.message}\n${error.stack || ""}`,
    });
  }

  return createErrorState(ErrorType.RENDER_ERROR, {
    message: "Unknown error",
    details: String(error),
  });
}
