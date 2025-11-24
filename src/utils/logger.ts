/**
 * Logging utilities for the PostgreSQL EXPLAIN Visualizer plugin
 *
 * Provides consistent logging with context and severity levels.
 */

/**
 * Plugin name for log prefixing
 */
const PLUGIN_NAME = "PostgresExplainVisualizer";

/**
 * Log severity levels
 */
type LogLevel = "error" | "warn" | "info" | "debug";

/**
 * Check if debug logging is enabled
 */
function isDebugEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Format log message with context
 */
function formatMessage(
  level: LogLevel,
  context: string,
  message: string,
  data?: any,
): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${PLUGIN_NAME}] [${level.toUpperCase()}] [${context}]`;

  if (data) {
    return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`;
  }

  return `${prefix} ${message}`;
}

/**
 * Log an error message
 *
 * @param context - Context/component where error occurred
 * @param message - Error message
 * @param error - Optional error object or data
 */
export function logError(context: string, message: string, error?: any): void {
  const formattedMessage = formatMessage("error", context, message);

  if (error) {
    if (error instanceof Error) {
      console.error(formattedMessage, error);
    } else {
      console.error(formattedMessage, error);
    }
  } else {
    console.error(formattedMessage);
  }
}

/**
 * Log a warning message
 *
 * @param context - Context/component where warning occurred
 * @param message - Warning message
 * @param data - Optional additional data
 */
export function logWarn(context: string, message: string, data?: any): void {
  const formattedMessage = formatMessage("warn", context, message, data);
  console.warn(formattedMessage);
}

/**
 * Log an info message
 *
 * @param context - Context/component
 * @param message - Info message
 * @param data - Optional additional data
 */
export function logInfo(context: string, message: string, data?: any): void {
  const formattedMessage = formatMessage("info", context, message, data);
  console.log(formattedMessage);
}

/**
 * Log a debug message (only in development)
 *
 * @param context - Context/component
 * @param message - Debug message
 * @param data - Optional additional data
 */
export function logDebug(context: string, message: string, data?: any): void {
  if (isDebugEnabled()) {
    const formattedMessage = formatMessage("debug", context, message, data);
    console.debug(formattedMessage);
  }
}

/**
 * Create a logger with a specific context
 *
 * @param context - Context/component name
 * @returns Logger object with bound context
 */
export function createLogger(context: string) {
  return {
    error: (message: string, error?: any) => logError(context, message, error),
    warn: (message: string, data?: any) => logWarn(context, message, data),
    info: (message: string, data?: any) => logInfo(context, message, data),
    debug: (message: string, data?: any) => logDebug(context, message, data),
  };
}
