export enum ErrorType {
  NO_DATA = "NO_DATA",
  FIELD_NOT_FOUND = "FIELD_NOT_FOUND",
  INVALID_FORMAT = "INVALID_FORMAT",
  PARSE_ERROR = "PARSE_ERROR",
  RENDER_ERROR = "RENDER_ERROR",
  CSP_VIOLATION = "CSP_VIOLATION",
}

export interface ErrorState {
  type: ErrorType;
  message: string;
  details?: string;
  resolutionHint: string;
  timestamp?: Date;
}

export const ERROR_SEVERITY: Record<ErrorType, "error" | "warning" | "info"> = {
  [ErrorType.NO_DATA]: "info",
  [ErrorType.FIELD_NOT_FOUND]: "warning",
  [ErrorType.INVALID_FORMAT]: "error",
  [ErrorType.PARSE_ERROR]: "error",
  [ErrorType.RENDER_ERROR]: "error",
  [ErrorType.CSP_VIOLATION]: "error",
};

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
      "Check the browser console for details.",
  },

  [ErrorType.CSP_VIOLATION]: {
    type: ErrorType.CSP_VIOLATION,
    message: "Plugin assets blocked by security policy",
    resolutionHint:
      "Contact your Grafana administrator. The plugin requires specific Content Security Policy settings to function.",
  },
};

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

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PlanError);
    }
  }

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

export function toErrorState(error: unknown): ErrorState {
  if (error instanceof PlanError) {
    return error.toErrorState();
  }

  if (error instanceof Error) {
    return {
      type: ErrorType.RENDER_ERROR,
      message: "Unexpected error",
      details: `${error.name}: ${error.message}\n${error.stack || ""}`,
      resolutionHint: ERROR_TEMPLATES[ErrorType.RENDER_ERROR].resolutionHint,
    };
  }

  return {
    type: ErrorType.RENDER_ERROR,
    message: "Unknown error",
    details: String(error),
    resolutionHint: ERROR_TEMPLATES[ErrorType.RENDER_ERROR].resolutionHint,
  };
}
